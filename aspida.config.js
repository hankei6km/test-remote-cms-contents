// const baseURL = () => {
//   const apiBaseURL = process.env.API_BASE_URL || '';
//   if (apiBaseURL === '' && process.env.NODE_ENV !== 'test') {
//     console.error('$API_BASE_URL is not defined.');
//   }
//   return apiBaseURL;
// };

// $axios で baseURL が定義されているので、ここでの指定は反映されない.
module.exports = { input: 'src/types/client' /* baseURL: baseURL()*/ };
