import { useState } from 'react'

function Test() {
  const [data, setData] = useState(null);
  const [dbdata, setDBData] = useState(null);
  const [dbquery, setDBQuery] = useState(null);
  const [image, setImage] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);

  // 1. GET Request: Fetching data on component load
  const handleButtonClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/get-rooms');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const handleButtonClickDB = async () => {
    try {
      console.log("test");
      const obj = {
        name: "test",
        pass: "test1"
      }
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
      }
      const response = await fetch('http://localhost:5000/api/db-login', options);
      const result = await response.json();
      setDBData(result);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const handleButtonClickDBQuery = async () => {
    try {
      const obj = {
        room: "room1",
      }
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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

  return (
    <>
      <h1>Test Page</h1>
      <button onClick={handleButtonClick}>Ping Server:</button>
      {data && <pre>{JSON.stringify(data, null)}</pre>}
      <br />
      <button onClick={handleButtonClickDB}>Get Database:</button>
      {dbdata && <pre>{JSON.stringify(dbdata, null, 1)}</pre>}
      <br />
      <button onClick={handleButtonClickDBQuery}>Query Database:</button>
      {dbquery && <pre>{JSON.stringify(dbquery, null, 1)}</pre>}
      <br />
      <img src={image2}></img>
      <br />
      <img src={image3}></img>
      <br />
      <button onClick={imageFetch}>Query Image:</button>
      <br />
      <img src={image}></img>
    </>
  )
}

export default Test;
