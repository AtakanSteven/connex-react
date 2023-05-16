import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  // to add server time to state.
  const [serverTime, setServerTime] = useState('');
  // to add the client and server time difference to state.
  const [timeDifference, setTimeDifference] = useState('');
  // to add gathered metrics to state.
  const [metrics, setMetrics] = useState('');
  const [isLoadingServerTime, setIsLoadingServerTime] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const formatTimeDifference = (difference) => {
    const hours = Math.floor(difference / 3600);
    const minutes = Math.floor((difference % 3600) / 60);
    const seconds = difference % 60;
    return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
  };

  const padNumber = (number) => {
    return String(number).padStart(2, '0');
  };

  useEffect(() => {
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        Authorization: 'Bearer mysecrettoken',
      },
    });

    const fetchServerTime = async () => {
      setIsLoadingServerTime(true);

      try {
        const response = await axiosInstance.get('/time/server');
        const epoch = response.data.data.epoch;
        setServerTime(epoch);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingServerTime(false);
      }
    };

    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);

      try {
        // Simulate a delay of 2 seconds before sending the API request.
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const response = await axiosInstance.get('/time/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    const fetchData = () => {
      fetchServerTime();
      fetchMetrics();
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Fetch data every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (serverTime !== '') {
      const currentTime = Math.floor(Date.now() / 1000);
      const difference = currentTime - serverTime;
      setTimeDifference(formatTimeDifference(difference));
    }
  }, [serverTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (serverTime !== '') {
        const currentTime = Math.floor(Date.now() / 1000);
        const difference = currentTime - serverTime;
        setTimeDifference(formatTimeDifference(difference));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [serverTime]);

  return (
      <div>
        <div>
          <h2>Server Time</h2>
          {isLoadingServerTime ? (
              <p>Loading server time...</p>
          ) : (
              <p>{serverTime}</p>
          )}
        </div>
        <div>
          <h2>Time Difference</h2>
          <p>{timeDifference}</p>
        </div>
        <div>
          <h2>Prometheus Metrics</h2>
          <small>Simulating a delay of 2 seconds before sending the API request to demonstrate how it works.</small>
          {isLoadingMetrics ? (
              <p>Loading metrics...</p>
          ) : (
              <pre>{JSON.stringify(metrics, null, 2)}</pre>
          )}
        </div>
      </div>
  );
};

export default App;
