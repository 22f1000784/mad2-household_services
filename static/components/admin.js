export default {
  template: `
    <div class="container mt-5">
      <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div class="container-fluid">
          <a class="navbar-brand fw-bold" href="#">Household App</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <router-link to="/createservice" class="nav-link">Create Service</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/services" class="nav-link">Services</router-link>
              </li>
            </ul>
            <button class="btn btn-danger" @click="logout">Logout</button>
          </div>
        </div>
        <div>
          <button @click="downloadReport" class="btn btn-primary">Download Report</button>
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

      <!-- Professionals Section with Search -->
      <div class="card shadow-sm p-3">
        <h3 class="text-success">Professionals</h3>
        
        <!-- Search Input -->
        <input v-model="searchQuery" @input="searchProfessionals" class="form-control mb-3" placeholder="Search professionals by name, service, or description">

        <ul class="list-group">
          <li v-for="pro in professionals" :key="pro.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>Name:</strong> {{ pro.name }} |
              <strong>Age:</strong> {{ pro.age }} |
              <strong>Phone:</strong> {{ pro.phone }} |
              <strong>Role:</strong> {{ pro.roles[0]?.name }} <br>
              <strong>Description:</strong> {{ pro.proffesional?.description || 'N/A' }} |
              <strong>Experience:</strong> {{ pro.proffesional?.experience || 'N/A' }} years |
              <strong>Service:</strong> {{ pro.proffesional?.service.name || 'N/A' }}
            </div>
            <button 
              class="btn" 
              :class="getButtonClass(pro)"
              @click="toggleStatus(pro)">
              {{ getButtonText(pro) }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  `,

  data() {
    return {
      users: [],
      searchQuery: '',
      token: localStorage.getItem('token')
    };
  },

  methods: {
    logout() {
      localStorage.clear();
      this.$router.push('/login');
    },

    async toggleStatus(user) {
      try {
        const userId = user.id; // Get the user ID
        const endpoint = user.active ? `/deactivate_user/${userId}` : `/activate_user/${userId}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token
          },
        });

        if (!response.ok) {
          throw new Error("Failed to update user status");
        }

        user.active = !user.active;
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    },

    async downloadReport() {
      try {
        const response = await fetch("http://127.0.0.1:5000/download-report", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to download the report");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "service_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading report:", error);
        alert("Failed to download the report. Please try again.");
      }
    },

    async searchProfessionals() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        return;
      }

      this.professionals = this.users.filter(user => 
        user.roles.some(role => role.name === 'professional') &&
        (
          user.name.toLowerCase().includes(query) ||
          user.proffesional?.service?.toLowerCase().includes(query) ||
          user.proffesional?.description?.toLowerCase().includes(query)
        )
      );
    },

    getButtonClass(pro) {
      return pro.active ? "btn-danger" : "btn-success";
    },

    getButtonText(pro) {
      return pro.active ? "Deactivate" : "Activate";
    }
  },

  computed: {
    customers() {
      return this.users.filter(user => 
        !user.roles.some(role => role.name === 'professional')
      );
    },

    professionals() {
      return this.users.filter(user => 
        user.roles.some(role => role.name === 'professional')
      );
    }
  },

  async mounted() {
    const resp = await fetch('/allusers', {
      headers: {
        "Authentication-Token": this.token,
        'Content-Type': 'application/json'
      }
    });

    if (resp.ok) {
      const data = await resp.json();
      this.users = data.map(user => ({
        ...user,
        active: user.active || false // Ensure `active` exists
      }));
    } else {
      alert('Something went wrong');
      localStorage.clear();
      this.$router.push('/login');
    }
  }
};
