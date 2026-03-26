import { useState,useEffect } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface FormData {
  email: string;
  password: string;
}

export default function Registeration() {
  const [isloading, setload] = useState(true)
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
  const nav = useNavigate();
  useEffect(()=>{
        console.log("Page routing function runned successful");
        const check_auth = async ()=>{
          try{
           const response  =await fetch(
        "/api/check-auth",
        {
          method : "GET",
          credentials : "include"
        }
      ) 
      const result = await response.json();
      console.log(result)
      if(result.authenticated){
        nav("/home")
      }
      else{
        setload(false)
      }
      }
      catch(e){
        console.log("server error")
        setload(false)
      }
        }
        check_auth()
    },[nav]);
    if(isloading){
      return <div>Loading....</div>
    }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setload(true)
    console.log(form.email);
    try{
    if (!form.email || !form.password) {
      setload(false)
      setError("All Fields are Required");
        setTimeout(()=>{
          setError("")
      },3000)
      return;
    }

    if (!form.email.includes("@")) {
      setload(false)
      setError("Invalid Email");
        setTimeout(()=>{
          setError("")
      },3000)
      return;
    }

    console.log("Register Data:", form);
     const response = await fetch(
        "/api/otp/generate" ,
        {
          method : "POST",
          headers : {"Content-Type" : "application/json"},
          body : JSON.stringify(form)
        }
       )
      if (!error && response.ok){
      localStorage.setItem("email",form.email)
      const result = await response.json()
       console.log(result)
       nav("/otppage")
       setload(false)
      }
      else{
        setload(false)
        setError("Invalid Login Credentials");
        setTimeout(()=>{
          setError("")
      },3000)
        return;
      }
    }
      catch(e){
          setload(false)
        setError("Server problem");
        setTimeout(()=>{
          setError("")
      },3000)
        return;
      }
      finally{
          setload(false)
        setError("Server problem");
        setTimeout(()=>{
          setError("")
      },3000)
        return;
      }

  };

  return (
    <div className="container-login">
      <form className="login-box-login" onSubmit={handleSubmit}>
        <h2 className="title-login">Register</h2>

        {error && <p className="error-login">{error}</p>}

        <input
          className="input-login"
          type=""
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
          Register
        </button>
      </form>
      <p onClick={()=>{nav("/login")}} style={{ marginTop: "25px", textAlign: "center", fontSize: "15px",color : "white",fontWeight : "bold",cursor : "pointer" }}>
  Already registered? Click {" "}
  <Link
    to="/login"
    style={{
      color: "white",
      fontWeight: "bold",
      textDecoration: "none",
      fontSize: "16px",
      padding: "4px 8px",
      borderRadius: "6px",
      transition: "0.3s",
      boxShadow: "white"
    }}
  >
    Login →
  </Link>
</p>
    </div>
  );
}