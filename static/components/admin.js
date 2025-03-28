export default {
	template:`
	  <div class="container mt-5">
	  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div class="container-fluid">
        
        <!-- App Name (Top Left) -->
        <a class="navbar-brand fw-bold" href="#">Household App</a>

        <!-- Responsive Toggle Button -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
          <!-- Left Side: Navigation Links -->
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link to="/createservice" class="nav-link">Create Service</router-link>
            </li>
			<li class="nav-item">
              <router-link to="/services" class="nav-link">Services</router-link>
            </li>
          </ul>

          <!-- Right Side: Logout Button -->
          <button class="btn btn-danger" @click="logout">Logout</button>
        </div>

      </div>
    </nav>
      <h2 class="text-center mb-4">Users List</h2>

      <!-- Customers Section -->
      <div class="card shadow-sm p-3 mb-4">
        <h3 class="text-primary">Customers (Non-Professionals)</h3>
        <ul class="list-group">
          <li v-for="user in customers" :key="user.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>Name:</strong> {{ user.name }} |
              <strong>Age:</strong> {{ user.age }} |
              <strong>Phone:</strong> {{ user.phone }} |
              <strong>Role:</strong> {{ user.roles[0]?.name }}
            </div>
            <button 
             class="btn" 
               :class="user.active ? 'btn-danger' : 'btn-success'"
                @click="toggleStatus(user)">
                 {{ user.active ? 'Deactivate' : 'Activate' }}
               </button>
          </li>
        </ul> 
      </div>

      <!-- Professionals Section -->
      <div class="card shadow-sm p-3">
        <h3 class="text-success">Professionals</h3>
        <ul class="list-group">
          <li v-for="pro in proffesionals" :key="pro.user.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>Name:</strong> {{ pro.user.name }} |
              <strong>Age:</strong> {{ pro.user.age }} |
              <strong>Phone:</strong> {{ pro.user.phone }} |
              <strong>Role:</strong> {{ pro.user.roles[0]?.name }} <br>
              <strong>Description:</strong> {{ pro.description }} |
              <strong>Experience:</strong> {{ pro.experience }} years
            </div>
            <button 
              class="btn" 
              :class="pro.user.active ? 'btn-danger' : 'btn-success'"
              @click="toggleStatus(pro.user)">
              {{ pro.user.active ? 'Deactivate' : 'Activate' }}
            </button>
          </li>
        </ul>
      </div>
    </div>
	
	`,
	data(){
		return{
			users:[],
			token:localStorage.getItem('token')
		}
	},
	methods:{
		
			logout(){
				localStorage.clear();
				this.$router.push('/login'); // Redirect to login page after logout
			  },async toggleStatus(user) {
				try {
				  // Select endpoint based on the user's active status
				  const endpoint = user.active ? `/deactivate_user/${user.id}` : `/activate_user/${user.id}`;
			
				  const response = await fetch(endpoint, {
					method: "POST",
					headers: {
					  "Content-Type": "application/json",
					  "Authentication-Token": localStorage.getItem("token"),
					},
				  });
			
				  if (!response.ok) {
					throw new Error("Failed to update user status");
				  }
			
				  // Toggle status without page reload
				  user.active = !user.active;
				} catch (error) {
				  console.error("Error updating user status:", error);
				}
			  },
	
	},
	computed: {
		customers() {
		  return this.users.filter(user => !user.proffesional);
		},
		proffesionals() {
		  return this.users
			.filter(user => user.proffesional)
			.map(user => ({
			  ...user.proffesional, // Professional details
			  user, // Corresponding user details
			}));
		}
	  },
	async mounted(){
		const resp = await fetch('/allusers',{headers:{"Authentication-Token":this.token,'Content-Type':'application/json'}})
		const data = await resp.json()
            if(resp.ok){
                this.users = data
                console.log(this.users)
			}
			else{
				alert('something went wrong');
				localStorage.clear();
				this.$push('/login');
			}
	}


}
