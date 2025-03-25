export default {
	template:`<div class="container-fluid" style="background-color: #f0f8ff;" > 
	                <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
			        <div class="navbar-nav">
	            <button class="btn btn-success mx-2" >HouseHold</button>
	            <button class="btn btn-success mx-2" @click="login">Login</button>
	        </div>
	    </nav>
	     <div class="d-flex justify-content-center align-items-center vh-100">
	         <button class="btn btn-danger bg-light text-danger border border-danger" @click = "registeration">Register</button>
	  </div>

	             </div>`,

methods:{
	login() {
		this.$router.push('/login');

	},
	registeration(){
		this.$router.push('/register');
	}

},
data(){
	return{
		form: {
			name: '',
			age: '',
			phone: '',
			email: '',
			role: 'customer',
			description: '',
			experience: ''
		  }
	};
}
}

