import axios from "axios";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1") + "/space";

export async function getallspace() {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await axios.get(`${API}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.spaces
    
  } catch (error) {
    console.error(error)
  }
}

export async function getspace(spaceId: string) {
  try {
    const token = localStorage.getItem('auth_token')
    console.log(token, "token")
    const response = await axios.get(`${API}/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data
    
  } catch (error) {
    console.error(error)
  }
}


export async function CreateSpace(data: { name: string, dimensions:string, mapId?: string }) {
  try{
    const token = localStorage.getItem('auth_token')

    const res = await axios.post(`${API}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log(res);
  }
  catch (error){
    console.error(error)
  }
}


export async function deleteSpace(spaceId: string ) {
    console.log("deleting space")
  try{
    const token = localStorage.getItem('auth_token')

    const res = await axios.delete(`${API}/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log(res);
  }
  catch (error){
    console.error(error)
  }
}