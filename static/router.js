import home from './components/home.js'
import login from './components/login.js'
import admin from './components/admin.js'
const routes = [
                {path:'/',component:home,admin},
	        {path:'/login',component:login},
	        {path:'/admin',component:admin},
	

]
export default new VueRouter( {routes})
