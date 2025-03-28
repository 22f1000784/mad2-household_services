import home from './components/home.js'
import login from './components/login.js'
import admin from './components/admin.js'
import register from './components/register.js'
import createservice from './components/createservice.js'
import services from './components/services.js'
import customer from './components/customer.js'
import servicerequest from './components/servicerequest.js'
import proffesional from './components/proffesional.js'
const routes = [
                {path:'/',component:home,admin},
	        {path:'/login',component:login},
	        {path:'/admin',component:admin},
			{path:'/register',component:register},
			{path:'/createservice',component:createservice},
			{path:'/services',component:services},
			{path:'/customer',component:customer},
			{path:'/servicerequests',component:servicerequest},
			{path:'/proffesional',component:proffesional}
	

]
export default new VueRouter( {routes})
