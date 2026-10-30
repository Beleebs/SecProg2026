import { useState } from 'react'
import axios from 'axios';

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
  const [cevent, setCEvent] = useState(null);
  const [eevent, setEEvent] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // Optional: for image preview
  const [uploadedUrl, setUploadedUrl] = useState('');


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
        room: "5",
      }
      const authHeader = localStorage.getItem('token');

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': "Bearer " + localStorage.getItem('token')
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
            "Content-Type": "application/json",
            'Authorization': "Bearer " + localStorage.getItem('token')
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
        image: "978ad2a19156e11d31572cef133751d9",
      }
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': "Bearer " + localStorage.getItem('token')
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

  const createAndEditEvent = async () => {
    try {
      const authHeader = localStorage.getItem('token');
      const obj1 = {
        room_id: 2,
        date: '2026-11-4'
      }

      const options1 = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': "Bearer " + authHeader
        },
        body: JSON.stringify(obj1)
      }
      const response1 = await fetch('http://localhost:5000/api/upload-event', options1);

      const result1 = await response1.json();
      setCEvent(result1)

      const obj2 = {
        id: 9,
        room_id: 6,
        date: '2026-11-15'
      }

      const options2 = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': "Bearer " + authHeader
        },
        body: JSON.stringify(obj2)
      }
      const response2 = await fetch('http://localhost:5000/api/edit-event', options2);

      const result2 = await response2.json();
      setEEvent(result2);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Submit file to backend
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file first');

    // FormData is required to transport binary file data
    const formData = new FormData();
    formData.append('image', file); // 'image' matches upload.single('image') in Express
    formData.append('event_id', 1); // 'image' matches upload.single('image') in Express
    formData.append('posted_by', 2);
    formData.append('art_name', "test");
    formData.append('desc', "test");
    formData.append('artist', "test");
    formData.append('date', new Date().toISOString().slice(0, 10));

    try {
      const response = await axios.post('http://localhost:5000/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Tells server to expect binary files
          'Authorization': "Bearer " + localStorage.getItem('token')
        }
      });

      setUploadedUrl(response.data.imageUrl); // Save URL returned by backend
      alert(response.data.message);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed.');
    }
  };

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
      <button onClick={createAndEditEvent}>Create And Edit Event:</button>
      <br />
      {cevent && <pre>{JSON.stringify(cevent, null, 1)}</pre>}
      {eevent && <pre>{JSON.stringify(eevent, null, 1)}</pre>}
      <br />

      <div style={{ padding: '20px' }}>
        <h2>Upload Image to Express</h2>
        <form onSubmit={handleUpload}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="submit">Upload</button>
        </form>

        {/* Client-side Preview */}
        {preview && (
            <div>
              <h3>Preview:</h3>
              <img src={preview} alt="Preview" style={{ width: '200px' }} />
            </div>
        )}

        {/* Server-side Rendered Image */}
        {uploadedUrl && (
            <div>
              <h3>Uploaded Image from Server:</h3>
              <img src={uploadedUrl} alt="Uploaded" style={{ width: '200px' }} />
              <p><a href={uploadedUrl} target="_blank" rel="noreferrer">View URL</a></p>
            </div>
        )}
      </div>
    </>
  )
}

export default Test;
