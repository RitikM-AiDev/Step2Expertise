import { useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
       setError("All fields are required");
        setTimeout(()=>{
            setError("")
        },3000)
      return;
    }

    if (!form.email.includes("@")) {
       setError("Invalid Email");
        setTimeout(()=>{
            setError("")
        },3000)
      return;
    }

    setError("");
    console.log("Login Data:", form);
     const response = await fetch(
        "/api/login" ,
        {
          method : "POST",
          headers : {"Content-Type" : "application/json"},
          body : JSON.stringify(form),
          credentials : "include"
        }
       )
      if(response.ok){
      const result = await response.json()
      console.log(result)
      nav("/home",{replace : true})
      
      }
      else{
        setError("Invalid email or password");
        setTimeout(()=>{
            setError("")
        },3000)
      }
  };

  return (
    <div className="container-login">
      <form className="login-box-login" onSubmit={handleSubmit}>
        <h2 className="title-login">Login</h2>

        {error && <p className="error-login">{error}</p>}

        <input
          className="input-login"
          type="email"
          name="email"
          placeholder="Enter email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          className="input-login"
          type="password"
          name="password"
          placeholder="Enter password"
          value={form.password}
          onChange={handleChange}
        />

        <button className="button-login" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}