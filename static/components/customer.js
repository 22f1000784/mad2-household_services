export default {
template:`<div class="card shadow-sm p-3">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <router-link to="/servicerequests" class="navbar-brand">Service Requests</router-link>
        <button class="btn btn-outline-danger ms-auto" @click="logout">Logout</button>
      </div>
    </nav>

    <h3 class="text-success text-center">Professionals</h3>

    <!-- Search Input -->
    <input type="text" v-model="searchQuery" @input="searchService" class="form-control mb-3" placeholder="Search services...">

    <ul class="list-group">
      <li v-for="pro in displayedProfessionals" 
          :key="pro.user.id" 
          class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        
        <div class="flex-grow-1">
          <h5 class="text-primary">{{ pro.user.name }}</h5>
          <p>
            <strong>Age:</strong> {{ pro.user.age }} | 
            <strong>Phone:</strong> {{ pro.user.phone }} <br>
            <strong>Role:</strong> {{ pro.user.roles[0]?.name }} <br>
            <strong>Description:</strong> {{ pro.description }} <br>
            <strong>Experience:</strong> {{ pro.experience }} years <br>
            <strong>Service:</strong> {{ pro.service.name }}
          </p>
        </div>

        <button class="btn btn-outline-success px-4" @click="requestService(pro.id)">
          Request Service
        </button>
      </li>
    </ul>
  </div>
`,
data() {
  return {
    searchQuery: '',
    professionals: [],  // Stores all professionals
    filteredProfessionals: [], // Stores filtered professionals based on search
  };
},
computed: {
  displayedProfessionals() {
    return this.searchQuery ? this.filteredProfessionals : this.professionals;
  }
},
async mounted() {
  // Load all professionals initially
  const resp = await fetch('/allusers', {
    headers: { "Authentication-Token": localStorage.getItem('token'), 'Content-Type': 'application/json' }
  });
  const data = await resp.json();
  if (resp.ok) {
    this.professionals = data
      .filter(user => user.proffesional)
      .map(user => ({
        ...user.proffesional,
        user,
      }));
  } else {
    alert('Something went wrong');
    localStorage.clear();
    this.$router.push('/login');
  }
},

methods: {
  async searchService() {
    if (this.searchQuery.length < 2) {
      this.filteredProfessionals = [];
      return;
    }

    try {
      const response = await fetch(`/search-service?q=${this.searchQuery}`);
      const data = await response.json();

      if (response.ok) {
        this.filteredProfessionals = data;
      } else {
        this.filteredProfessionals = [];
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  },
  logout() {
    localStorage.clear();
    this.$router.push('/login');
  },
  async requestService(professionalId) {
    try {
      const response = await fetch(`/service-request/${professionalId}`, {
        method: "POST",
        headers: {
          "Authentication-Token": localStorage.getItem('token'),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
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
