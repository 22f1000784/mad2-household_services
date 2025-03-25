import home from './components/home.js'
import login from './components/login.js'
import admin from './components/admin.js'
import register from './components/register.js'
import createservice from './components/createservice.js'
import services from './components/services.js'
const routes = [
                {path:'/',component:home,admin},
	        {path:'/login',component:login},
	        {path:'/admin',component:admin},
			{path:'/register',component:register},
			{path:'/createservice',component:createservice},
			{path:'/services',component:services}
	

]
export default new VueRouter( {routes})
