import { useState } from 'react'

function App() {
  const [data, setData] = useState(null);
  const [dbdata, setDBData] = useState(null);

  // 1. GET Request: Fetching data on component load
  const handleButtonClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/message');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  const handleButtonClickDB = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/db-check');
      const result = await response.json();
      setDBData(result);
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  };

  return (
    <>
      <h1>Title</h1>
      <button onClick={handleButtonClick}>Ping Server:</button>
      {data && <p>{JSON.stringify(data, null)}</p>}
      <button onClick={handleButtonClickDB}>Get Database:</button>
      {dbdata && <p>{JSON.stringify(dbdata, null)}</p>}
    </>
  )
}

export default App
