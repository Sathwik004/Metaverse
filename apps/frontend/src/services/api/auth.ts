import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function signup(data: { username: string; password: string }) {
  try {
    const response = await axios.post(`${API}/signup`, data, {
  withCredentials: true
});
    console.log(response.data)
    if (response.status === 200 || response.status === 201) {
      return {
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    return { success: false, error };
  }
}

export async function login(data: { username: string; password: string }) {
  try {
    const response = await axios.post(`${API}/signin`, data);
    // Cookies are in response.headers['set-cookie'] (Node.js) or document.cookie (browser)
    // console.log("Set-Cookie heeeader:", response.headers['set-cookie']);
    if (response.status === 200) {
      if (response.data && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return {
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    return { success: false, error };
  }
}

export async function signout(){
  console.log("Signing out")
  try{
    const res = await axios.post(`${API}/signout`);
    console.log(res)
    localStorage.removeItem('auth_token')
    return res;
  }
  catch(error){
    return null;
  }
}
