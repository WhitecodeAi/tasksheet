import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TimesheetEntryForm from '../Components/TimesheetEntryForm';
 

const TimesheetPage = () => {
    const [projects, setProjects] = useState([]);
const [taskCategories, setTaskCategories] = useState([]);

    useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
  axios.get('http://localhost:3001/api/task-categories')
    .then((res) => setTaskCategories(res.data))
    .catch((err) => console.error("Failed to fetch task categories", err));
}, []);



  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  return (
    <div>
      <TimesheetEntryForm projects={projects} user={loggedInUser} taskCategories={taskCategories} />
    </div>
  );
};

export default TimesheetPage;
