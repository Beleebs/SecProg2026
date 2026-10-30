import { useState } from 'react'
import axios from "axios";

function Test() {
  const [data, setData] = useState(null);
  const [dbquery, setDBQuery] = useState(null);
  const [image, setImage] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [regRes, setRegRes] = useState(null);
  const [loginRes, setLoginRes] = useState(null);
  const [events, setEvents] = useState(null);
  const [event, setEvent] = useState(null);
  const [file, setFile] = useState()
  const [description, setDescription] = useState("")
  const [imageName, setImageName] = useState()

  // 1. GET Request: Fetching data on component load
  const handleButtonClick = async () => {
    try {
      const authHeader = localStorage.getItem('token');

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': "Bearer " + authHeader
        },
      }
      const response = await fetch('http://localhost:5000/api/get-rooms', options);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const handleButtonClickImage = async () => {
    try {
      const obj = {
        room: "6",
      }
      const authHeader = localStorage.getItem('token');

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': "Bearer " + authHeader
        },
        body: JSON.stringify(obj)
      }
      const response = await fetch('http://localhost:5000/api/enter-room', options);
      console.log(response);
      const result = await response.json();
      setDBQuery(result);console.log(result.contents[0]);

      let images = result.contents;
      console.log(images);

      for(let i = 0; i < images.length; i++){
        console.log(images[0]);
        const obj = {
          image: images[i]['image_path'],
        }
        console.log(obj);

        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(obj)
        }
        const response = await fetch('http://localhost:5000/api/fetch-image', options);
        const result = await response.blob();
        let objectURL = URL.createObjectURL(result);
        if (i === 0)
        {
          setImage2(objectURL);
        }
        else
        {
          setImage3(objectURL);
        }
      }
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const imageFetch = async () => {
    try {
      console.log("test image");
      const obj = {
        image: "image1.png",
      }
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
      }
      const response = await fetch('http://localhost:5000/api/fetch-image', options);
      const result = await response.blob();
      let objectURL = URL.createObjectURL(result);
      setImage(objectURL);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const testReg = async () => {
    try {
      console.log("test reg");
      const obj = {
        email: "email3@email.com",
        password: "password",
      }

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
      }

      console.log(options);
      const response = await fetch('http://localhost:5000/api/db-register', options);
      const result = await response.json();
      setRegRes(result);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const testLogin = async () => {
    try {
      console.log("test reg");
      const obj = {
        email: "admin@email.com",
        password: "password",
      }

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
      }

      console.log(options);
      const response = await fetch('http://localhost:5000/api/db-login', options);
      const result = await response.json();
      localStorage.setItem("token", result["token"]);
      setLoginRes(result);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const eventsFetch = async () => {
    try {
      const authHeader = localStorage.getItem('token');

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': "Bearer " + authHeader
        }
      }
      const response = await fetch('http://localhost:5000/api/fetch-events', options);

      const result = await response.json();
      setEvents(result);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const eventFetch = async () => {
    try {
      const authHeader = localStorage.getItem('token');
      const obj = {
        event: "6",
      }

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': "Bearer " + authHeader
        },
        body: JSON.stringify(obj)
      }
      const response = await fetch('http://localhost:5000/api/fetch-event', options);

      const result = await response.json();
      setEvent(result);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const submit = async event => {
    event.preventDefault()

    const formData = new FormData()
    formData.append("event_id", 1);
    formData.append("image_path", file);
    formData.append("desc", description);
    formData.append("artist", "testArtist");
    formData.append("date", new Date().toISOString().slice(0, 10));

    const result = await axios.post('/api/upload-image', formData, { headers: {'Content-Type': 'multipart/form-data'}})
    setImageName(result.data.imageName)
  }

  return (
    <>
      <h1>Test Page</h1>
      <button onClick={handleButtonClick}>Ping Server:</button>
      {data && <pre>{JSON.stringify(data, null)}</pre>}
      <br />
      <button onClick={handleButtonClickImage}>Query Database:</button>
      {dbquery && <pre>{JSON.stringify(dbquery, null, 1)}</pre>}
      <br />
      <img src={image2}></img>
      <br />
      <img src={image3}></img>
      <br />
      <button onClick={imageFetch}>Query Image:</button>
      <br />
      <img src={image}></img>
      <br/>
      <button onClick={testReg}>Query Reg:</button>
      <br />
      {regRes && <pre>{JSON.stringify(regRes, null, 1)}</pre>}
      <br />
      <button onClick={testLogin}>Query Login:</button>
      <br />
      {loginRes && <pre>{JSON.stringify(loginRes, null, 1)}</pre>}
      <br />
      <button onClick={eventsFetch}>Query Events:</button>
      <br />
      {events && <pre>{JSON.stringify(events, null, 1)}</pre>}
      <br />
      <button onClick={eventFetch}>Query Event:</button>
      <br />
      {event && <pre>{JSON.stringify(event, null, 1)}</pre>}
      <br />

      <form onSubmit={submit}>
        <input
            filename={file}
            onChange={e => setFile(e.target.files[0])}
            type="file"
            accept="image/*"
        ></input>
        <input
            onChange={e => setDescription(e.target.value)}
            type="text"
        ></input>
        <button type="submit">Submit</button>
      </form>
    </>
  )
}

export default Test;
