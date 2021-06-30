import axios from "axios";
import { useEffect, useState } from "react";
import GoogleMapReact from "google-map-react";
import { data } from "./data.js";
import { Modal, Table } from "react-bootstrap";

function App() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [search, setSearch] = useState(null);

  // getting the access token
  const authenticateUser = () => {
    var scopes = "";
    var authURL =
      "https://accounts.spotify.com/authorize" +
      "?response_type=token" +
      "&client_id=" +
      process.env.REACT_APP_CLIENT_ID +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent(process.env.REACT_APP_REDIRECT_URL);

    window.location = authURL;
  };

  // authenticating and getting the access token and refresh token
  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      authenticateUser();
    }
    const parsedHash = new URLSearchParams(window.location.hash.substr(1));
    const access_token = parsedHash.get("access_token");
    if (access_token !== null) {
      console.log(token);
      localStorage.setItem("token", access_token);
      setToken(access_token);
      window.location = "/";
    }
    return () => {
      console.log("remove");
      localStorage.removeItem("token");
    };
  }, [token]);

  const getTop = async (country) => {
    await axios
      .get(`${process.env.REACT_APP_WEB_API}/${country}/${token}`)
      .then((response) => {
        if (response.data !== "Error") {
          setSearch(response.data);
          handleShow();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627,
    },
    zoom: 1,
  };
  const handleApiLoaded = (map, maps) => {
    for (let x = 0; x < data.length; x++) {
      let country = data[x];
      let path = "";
      if (country.multi === "multigeo") {
        let countryCordsArray = [];
        let coordinatesGroup = country.xml.Polygon;
        for (let i = 0; i < coordinatesGroup.length; i++) {
          let coordinate =
            coordinatesGroup[i].outerBoundaryIs.LinearRing.coordinates.split(
              " "
            );
          let countryCords = [];
          for (let j = 0; j < coordinate.length; j++) {
            let temp = coordinate[j].split(",");
            countryCords.push(new maps.LatLng(temp[1], temp[0]));
          }
          countryCordsArray.push(countryCords);
        }
        path = countryCordsArray;
      } else {
        let countryCords = [];
        let coordinates =
          country.xml.outerBoundaryIs.LinearRing.coordinates.split(" ");
        for (let i = 0; i < coordinates.length; i++) {
          let temp = coordinates[i].split(",");
          countryCords.push(new maps.LatLng(temp[1], temp[0]));
        }
        path = countryCords;
      }
      const polygon = new maps.Polygon({
        paths: path,
        strokeColor: "#FF0000",
        strokeOpacity: 0,
        title: country.country,
        strokeWeight: 1,
        fillOpacity: 0.0,
      });
      polygon.setMap(map);
      maps.event.addListener(polygon, "mouseover", function () {
        this.setOptions({ fillColor: "#f5c879", fillOpacity: 0.5 });
      });

      maps.event.addListener(polygon, "mouseout", function () {
        this.setOptions({ fillColor: "#f5c879", fillOpacity: 0 });
      });

      maps.event.addListener(polygon, "click", async function (event) {
        await getTop(this.title);
      });
    }
  };

  return (
    <>
      <div style={{ height: "100vh", width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.REACT_MAPS }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
        ></GoogleMapReact>
      </div>
      <div>
        <Modal
          show={show}
          onHide={handleClose}
          size="lg"
          style={{ height: "100vh" }}
        >
          {search !== null && (
            <>
              <Modal.Header closeButton>
                <Modal.Title
                  className="display-4"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={search.images[0].url}
                    style={{
                      height: "128px",
                      margin: "10px",
                      borderRadius: "10px",
                    }}
                    alt="Cover"
                  ></img>
                  <h1 className="display-4">{search.name}</h1>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ overflowY: "scroll", height: "75vh" }}>
                <Table striped hover>
                  <thead>
                    <th>#</th>
                    <th></th>
                    <th>Name</th>
                  </thead>
                  <tbody>
                    {search.tracks.items.map((track, index) => {
                      return (
                        <tr>
                          <td>{index}</td>
                          <th>
                            <img
                              alt="art"
                              src={track.track.album.images[2].url}
                            ></img>
                          </th>
                          <td>
                            <h5>
                              <a
                                style={{
                                  textDecoration: "none",
                                  color: "black",
                                }}
                                href={track.track.external_urls.spotify}
                              >
                                {track.track.name}
                              </a>
                            </h5>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Modal.Body>
            </>
          )}
        </Modal>
      </div>
    </>
  );
}

export default App;
