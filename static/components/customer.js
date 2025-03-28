export default {
template:`<div class="card shadow-sm p-3">
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <!-- Left: Service Requests Link -->
      <router-link to="/servicerequests" class="navbar-brand">Service Requests</router-link>

      <!-- Right: Logout Button -->
      <button class="btn btn-outline-danger ms-auto" @click="logout">Logout</button>
    </div>
  </nav>
  <h3 class="text-success text-center">Professionals</h3>
  
  <ul class="list-group">
    <li v-for="pro in proffesional" 
        :key="pro.user.id" 
        class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      
      <!-- Left: Professional Details -->
      <div class="flex-grow-1">
        <h5 class="mb-1 text-primary">{{ pro.user.name }}</h5>
        <p class="mb-1">
          <strong>Age:</strong> {{ pro.user.age }} | 
          <strong>Phone:</strong> {{ pro.user.phone }} <br>
          <strong>Role:</strong> {{ pro.user.roles[0]?.name }} <br>
          <strong>Description:</strong> {{ pro.description }} <br>
          <strong>Experience:</strong> {{ pro.experience }} years <br>
          <strong>Service:</strong> {{ pro.service.name }} 

        </p>
      </div>

      <!-- Right: Request Service Button -->
      <button class="btn btn-outline-success px-4" @click="requestService(pro.id)">
        Request Service
      </button>
    </li>
  </ul>
</div>
`,
data(){
    return{
        users:[]
    }
},
computed: {
   
    proffesional() {
      return this.users
        .filter(user => user.proffesional)
        .map(user => ({
          ...user.proffesional, // Professional details
          user, // Corresponding user details
        }));
    }
  },
  async mounted(){
    const resp = await fetch('/allusers',{headers:{"Authentication-Token":localStorage.getItem('token'),'Content-Type':'application/json'}})
    const data = await resp.json()
        if(resp.ok){
            this.users = data
            console.log(this.users)
        }
        else{
            alert('something went wrong');
            localStorage.clear();
            this.$router.push('/login');
        }
}, methods:{
    logout(){
        localStorage.clear();
        this.$router.push('/login'); // Redirect to login page after logout
      },
      async requestService(proffesionalId) {
        try {
            const response = await fetch(`/service-request/${proffesionalId}`, {
                method: "POST",  // Fix: Set correct HTTP method
                headers: {
                    "Authentication-Token":localStorage.getItem('token'), // Fix: Use correct header
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({}) // Fix: Include an empty JSON body
            });
    
            const data = await response.json();
            
            if (response.ok) {
                alert("Service request created successfully!");
                console.log("Server response:", data);
            } else {
                alert(`Error: ${data.message || data.error}`);
                console.error("Error response:", data);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Failed to connect to the server.");
        }
      },
}
}
