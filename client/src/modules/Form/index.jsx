import { useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";

const Form = ({ isSignInPage = true }) => {
  const [data, setData] = useState({
    ...(isSignInPage && {
      fullName: "",
    }),
    email: "",
    password: "",
  });
  // console.log(data);
  const navigate=useNavigate();

  const handleSubmit= async (e)=>{
    e.preventDefault();
    console.log(data);
    const res= await fetch(`http://localhost:8000/api/${isSignInPage ? 'login':'register'}`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if(res.status === 400){
      alert('Invalid Credentials');
    } else{
      const resData = await res.json();
      console.log('Response Data:', resData);
      if(resData.token){
        localStorage.setItem('user:token', resData.token);
        localStorage.setItem('user:detail', JSON.stringify(resData));
        navigate('/');
      }
    }
  }
  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-center mb-2">
        Welcome {isSignInPage && "Back"}!!
      </h2>
      <h2 className="text-md font-semibold text-center mb-6">
        {" "}
        {isSignInPage ? "Sign In to Chat" : "Sign Up to Explore"}!
      </h2>
      <div className="mb-4">
        <form
          onSubmit={(e) => 
            handleSubmit(e)
          }
        >
          {!isSignInPage && (
            <Input
              label="Full Name"
              type= "text"
              name="name"
              placeholder="Enter your Full Name"
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
            />
          )}
          <Input
            type="email"
            label="Email"
            name="email"
            placeholder="Enter your Email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter the password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
          <Button type='submit' label={isSignInPage ? "Sign In" : "Sign Up"} />
        </form>
        <div className="mt-4 text-center">
          {isSignInPage ? "Didn't have an Account" : "Already have an account"}?
          <span className="text-primary cursor-pointer" onClick={()=>navigate(`/users/${isSignInPage? 'sign_up':'sign_in'}`)}>
            {!isSignInPage ? " Sign In" : " Sign Up"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Form;
