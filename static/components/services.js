export default{
    template:`
    <div class="container mt-4">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <!-- Left: Admin & Services Links -->
      <div class="d-flex">
        <router-link to="/admin" class="nav-link text-white me-3">Admin</router-link>
        <router-link to="/createservice" class="nav-link text-white">Create Services</router-link>
      </div>

      <!-- Right: Logout Button -->
      <button @click="logout" class="btn btn-outline-light ms-auto">Logout</button>
    </div>
  </nav>
    <h2 class="text-center">Manage Services</h2>

    <!-- Service List -->
    <div v-if="services.length" class="table-responsive">
      <table class="table table-striped table-bordered">
        <thead class="table-dark">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price (₹)</th>
            <th>Time Required (hrs)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.name">
            <td>
              <input v-model="service.name" class="form-control" />
            </td>
            <td>
              <input v-model="service.Description" class="form-control" />
            </td>
            <td>
              <input v-model.number="service.price" type="number" class="form-control" />
            </td>
            <td>
              <input v-model.number="service.time_required" type="number" class="form-control" />
            </td>
            <td>
              <button @click="updateService(service)" class="btn btn-success btn-sm me-2">Update</button>
              <button @click="deleteService(service.id)" class="btn btn-danger btn-sm">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Loading Message -->
    <p v-else class="text-center">Loading services...</p>
  </div>
    `,
    data() {
        return {
          services: [],
        };
      },
      mounted() {
        this.fetchServices();
      },
      methods: {
        // Fetch all services
        async fetchServices() {
          try {
            const response = await fetch("/all_services", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token": localStorage.getItem('token') 
                }
              });
            this.services = await response.json();
          } catch (error) {
            console.error("Error fetching services:", error);
          }
        },
    
        // Update a service
        async updateService(service) {
          try {
            const response = await fetch(`/update_service/${service.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json","Authentication-Token":localStorage.getItem('token') },
              body: JSON.stringify(service),
            });
    
            if (response.ok) {
              alert("Service updated successfully!");
            } else {
              alert("Failed to update service.");
            }
          } catch (error) {
            console.error("Error updating service:", error);
          }
        },
    
        // Delete a service
        async deleteService(serviceid) {
          if (!confirm("Are you sure you want to delete this service?")) return;
    
          try {
            const response = await fetch(`/delete_service/${serviceid}`, {
              method: "DELETE",headers: { "Content-Type": "application/json","Authentication-Token":localStorage.getItem('token') }
            });
    
            if (response.ok) {
              
              alert("Service deleted successfully!");
              location.reload();
            } else {
              alert("Failed to delete service.");
            }
          } catch (error) {
            console.error("Error deleting service:", error);
          }
        },
        logout(){
            localStorage.clear();
            this.$router.push('/login'); // Redirect to login page after logout
          },
      },
}