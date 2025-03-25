export default { template:`
	<body class="bg-light">
    <nav class="navbar navbar-light bg-light">
  <div class="container">
    <a href="/" class="btn btn-outline-primary">Back to Home</a>
  </div>
</nav>

    <!-- Error Message -->
    <div class="d-flex justify-content-center align-items-center vh-100 flex-column">
        <!-- Conditionally display the error message -->
        <div v-if="error" class="alert alert-danger text-center w-50">
            {{ error }}
        </div>

        <!-- Login Form -->
        <div class="form-container bg-white p-4 rounded shadow">
            <h2 class="text-center mb-4">Login</h2>
            <form>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input 
                        type="email" 
                        class="form-control" 
                        id="email" 
                        placeholder="Enter your email" 
                        required 
                        v-model="cred.email"
                    >
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input 
                        type="password" 
                        class="form-control" 
                        id="password" 
                        placeholder="Enter your password" 
                        required 
                        v-model="cred.password"
                    >
                </div>
                <button 
                    type="submit" 
                    class="btn btn-primary w-100" 
                    @click="login"
                >
                    Login
                </button>
            </form>
        </div>
    </div>
</body>

            `,
	data(){
        return{
		cred:{email:null,
			password:null

	},
	error:null,
	}

	},
	methods:{
       async login(){
          	    const resp = await fetch('/user-login',{
                                        method:'POST',
			    headers:{
                              "Content-Type":'application/json'

			    },
			    body: JSON.stringify(this.cred)
	       })
		   const data = await resp.json()

	       if (resp.ok){
            
		       console.log(data);
		       localStorage.setItem('token',data.authentication_token);
		       localStorage.setItem('role',data.role);
               console.log(data.role)
               if(data.role == 'admin'){
                this.$router.push('/admin')
               }
		       
	       }
		   else{
			this.error = data['message']
		   }
          
	}

	},
	
}
