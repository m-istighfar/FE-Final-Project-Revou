/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const InitialDataFetching = ({ source, setData }) => {
	axios
		.get(`http://localhost:3001/api/${source}`)
		.then((response) => {
			setData(response.data);
		})
		.catch((error) => {
			console.error(error);
		});
};

export default InitialDataFetching;