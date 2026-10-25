import { useState } from 'react'

function Test() {
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
      <h1>Test Page</h1>
      <button onClick={handleButtonClick}>Ping Server:</button>
      {data && <pre>{JSON.stringify(data, null)}</pre>}
      <button onClick={handleButtonClickDB}>Get Database:</button>
      {dbdata && <pre>{JSON.stringify(dbdata, null, 1)}</pre>}
    </>
  )
}

export default Test
