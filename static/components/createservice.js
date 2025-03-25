export default{
    template:`
    <div class="container mt-4">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <!-- Left: Admin & Services Links -->
      <div class="d-flex">
        <router-link to="/admin" class="nav-link text-white me-3">Admin</router-link>
        <router-link to="/services" class="nav-link text-white">Services</router-link>
      </div>

      <!-- Right: Logout Button -->
      <button @click="logout" class="btn btn-outline-light ms-auto">Logout</button>
    </div>
  </nav>
    <h2 class="text-center">Create Service</h2>

    <form @submit.prevent="submitForm" class="shadow p-4 bg-white rounded">
      <!-- Name -->
      <div class="mb-3">
        <label class="form-label">Service Name</label>
        <input type="text" v-model="service.name" class="form-control" required>
      </div>

      <!-- Price -->
      <div class="mb-3">
        <label class="form-label">Price (in INR)</label>
        <input type="number" v-model="service.price" class="form-control" required>
      </div>

      <!-- Time Required -->
      <div class="mb-3">
        <label class="form-label">Time Required</label>
        <input type="text" v-model="service.time_required" class="form-control" required>
      </div>

      <!-- Description -->
      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea v-model="service.description" class="form-control" required></textarea>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn btn-primary w-100">Create Service</button>
    </form>

    <!-- Success/Error Message -->
    <div v-if="message" class="alert mt-3" :class="messageClass">
      {{ message }}
    </div>
  </div>

    `,
    data() {
        return {
          service: {
            name: "",
            price: "",
            time_required: "",
            description: "",
          },
          message: "",
          messageClass: "",
        };
      },
      methods: {
        async submitForm() {
          try {
            const response = await fetch("/service/creation", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authentication-Token":localStorage.getItem('token')
              },
              body: JSON.stringify(this.service),
            });
    
            const data = await response.json();
    
            if (response.ok) {
              this.message = "Service created successfully!";
              this.messageClass = "alert-success";
              this.service = { name: "", price: "", time_required: "", description: "" }; // Reset form
            } else {
              this.message = data.error || "Failed to create service.";
              this.messageClass = "alert-danger";
            }
          } catch (error) {
            this.message = "An error occurred.";
            this.messageClass = "alert-danger";
          }
        },
        logout(){
            localStorage.clear();
            this.$router.push('/login'); // Redirect to login page after logout
          },
      },

}