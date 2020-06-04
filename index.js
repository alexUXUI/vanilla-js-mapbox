/** Initialize Map */

/** Token */
mapboxgl.accessToken = process.env.MAPBOX_TOKEN

/** Map */
var MAP = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v10',
  center: [-75.565615, 6.246204 ],
  zoom: 14
})

/** Barrios EP */
const BARRIOS = 'https://feedthebarrios.com/wp-json/wp/v2/posts?categories=23'

/** Get Barrios from WP  */
function getBarrios() {
  return fetch(BARRIOS).then((response) => {
    if (response.status === 200) {
      return response.json()
    }
    return []
  })
}

/** Handles Barrio List view Map interaction */
const mapInteractionIn = (barrio, newBarrioItem, popup) => {
  return (event) => {
    console.log(barrio, newBarrioItem, popup, event)
    
    /** Highlight list item to show selected */   
    newBarrioItem.style.background = "white"
    newBarrioItem.style.color = "black"

    /** Fly to right place on Map */
    MAP.flyTo({
      center: [Number(barrio.geometry.coordinates[0]) - .0075, barrio.geometry.coordinates[1]],
      essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });

    /** Pop that pop up */
    popup.addTo(MAP)
  }
}

const mapInteractionOut = (barrio, newBarrioItem, popup) => {
  return (event) => {
    newBarrioItem.style.background = '#e22658'
    newBarrioItem.style.color = 'white'
    popup.remove()
  }
}

/** Creates Barrio List view */
let barriosList = document.querySelector('#barrios-list')

/** Dynamically adds list items to Barrio list view */
const barrioListItem = (barrio, popup) => {
  
  /** Assemble and attach barrio list items to left of map */
  let newBarrioItem = document.createElement('li')
  newBarrioItem.textContent = barrio.properties.title
  newBarrioItem.className = "barrio__item"
  newBarrioItem.style.backgroundColor = "#e22658"
  newBarrioItem.style.boxShadow = '0 0 5px rgba(155, 155, 155, 0.856)'
  barriosList.appendChild(newBarrioItem)

  /** Hook the list items up to the map pop up */
  newBarrioItem.addEventListener('mouseenter', mapInteractionIn(barrio, newBarrioItem, popup), false)
  newBarrioItem.addEventListener('mouseout', mapInteractionOut(barrio, newBarrioItem, popup), false)
}

/** Wait for map to be ready, then add the Barrios to the map and the list */
MAP.on('load',  () => {
  return getBarrios().then(data => {
    makeGeoJson(data).features.forEach((barrio) => {
     
      /** make map marker with logo */
      var el = document.createElement('div');
      var image = document.createElement('img')
      image.src = 'http://feed-the-barrios.local/wp-content/uploads/2020/05/Screen-Shot-2020-05-25-at-1.25.04-PM.png'
      el.appendChild(image)
      el.className = 'marker';
      el.style.backgroundImage = 'http://feed-the-barrios.local/wp-content/uploads/2020/05/Screen-Shot-2020-05-25-at-1.25.04-PM.png';
      el.style.width = '50px';
      el.style.height = '50px';

      /** make pop up */
      var popup = new mapboxgl
        .Popup({offset: [0, -30], closeButton: true, className: "yung-poppers" })
        .setHTML(`<div class="yung-poppers__content" id="regular-text">
          <h4>${barrio.properties.title}</h4>
          <img src="${barrio.properties.image}" />
          <p style="font-size: 20px"><div style="font-size: 20px">${barrio.properties.description}</div></p>
        </div>`)
      
      /** make marker */
      var marker = new mapboxgl.Marker(el)
        .setLngLat(barrio.geometry.coordinates)
        .setPopup(popup) // sets a popup on this marker
        .addTo(MAP);

      barrioListItem(barrio, popup)
    })
  }).catch(e => {
    console.log(e)
    console.log('Could not create barrio view')
    return "Could not create view"
  })
})

function makeGeoJson(data) {
  return {
    "type": "FeatureCollection",
    "features": [
      ...data.map(barrio => {
        return {
          "type": "Feature",
          "properties": {
            "title": barrio.acf.title,
            "image": barrio.acf.image,
            "description": barrio.acf.descripton,
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              barrio.acf.longitude,
              barrio.acf.latitude
            ]
          }
        }
      })
    ]
  }
}

