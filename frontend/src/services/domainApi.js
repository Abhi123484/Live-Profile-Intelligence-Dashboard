import axios from 'axios';

const API = 'http://localhost:5000/api/domains';

export const fetchDomains = () => axios.get(API);
