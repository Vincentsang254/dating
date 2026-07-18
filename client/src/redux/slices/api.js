export const url = import.meta.env.VITE_API_URL || "https://dating-rpig.onrender.com/api";

export const setHeaders = () => {
  const headers = {
    headers: {
      "x-auth-token": localStorage.getItem("token"),
    },
  };

  return headers;
};
