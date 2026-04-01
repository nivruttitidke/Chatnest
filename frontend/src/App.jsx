import { Navigate, Route, Routes } from 'react-router';
import HomePage from "./Pages/HomePage.jsx";
import SignupPage from "./Pages/SignupPage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import ChatPage from "./Pages/ChatPage.jsx";
import CallPage from "./Pages/CallPage.jsx";
import NotificationPage from "./Pages/NotificationPage.jsx";
import OnboardingPage from "./Pages/OnboardingPage.jsx";

import { Toaster } from "react-hot-toast";
import PageLoader from './components/PageLoader.jsx';
import useAuthUser from './hooks/useAuthUser.js';
import  Layout  from './components/Layout.jsx';
import { useThemeStore } from './store/useThemeStore.js';

function App() {
  
const{isLoading, authUser} = useAuthUser();
const { theme } = useThemeStore();
const isAuthenticated = Boolean(authUser);
const isOnboarded = authUser?.isOnboarded;
  
 if(isLoading) return <PageLoader/>;

  return (
    <div className="h-screen " data-theme={theme}>
      <Routes>
        <Route path='/' element={ isAuthenticated && isOnboarded ?
           (
            <Layout showSidebar>
           < HomePage />
           </Layout>
          ) :
           (<Navigate to={!isAuthenticated ? "/login": "/onboarding"}/>)}
          />
          
        <Route path='/signup' element={!isAuthenticated ? <SignupPage /> :<Navigate to={isOnboarded ? "/" : "/onboarding"}/>}/>
        <Route path='/login' element={!isAuthenticated ? <LoginPage /> :<Navigate to={isOnboarded ? "/" : "/onboarding"}/>}/>
        <Route path='/chat/:id' element={ isAuthenticated && isOnboarded ?  (<Layout showSidebar={false}>
          <ChatPage />
        </Layout>) :(<Navigate to={!isAuthenticated ? "/login": "/onboarding"} />  )}/>
        <Route path='/call/:id' element={ isAuthenticated && isOnboarded ? (
          <CallPage />
        ) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />) }/>
        <Route path='/notification' element={ isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true} >
            <NotificationPage/>
          </Layout>
        ) :(<Navigate to={!isAuthenticated ? "/login" : "/onboarding"}/>)}/>
        <Route path='/onboarding' 
        element={ isAuthenticated ? 
        (!isOnboarded ? (<OnboardingPage /> ) 
        :(<Navigate to={"/"} />)) 
        : (<Navigate to="/login" />) }/>

      </Routes>
      <Toaster />

    </div>
  );
}

export default App;