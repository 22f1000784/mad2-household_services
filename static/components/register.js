export default {
    template:`  <div class="container mt-5">
    <nav class="navbar navbar-light bg-light">
  <div class="container">
    <a href="/" class="btn btn-outline-primary">Back to Home</a>
  </div>
</nav>

    <div class="card shadow-lg p-4">
      <h2 class="text-center mb-4">Registration Form</h2>
      <form @submit.prevent="submitForm">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input type="text" class="form-control" v-model="form.name" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Age</label>
          <input type="number" class="form-control" v-model="form.age" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Phone</label>
          <input type="tel" class="form-control" v-model="form.phone" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="form.email" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" v-model="form.password" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Role</label>
          <select class="form-select" v-model="form.role" @change="toggleRole">
            <option value="customer">Customer</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <transition name="fade" mode="out-in">
          <div v-if="form.role === 'professional'" key="professional" class="border p-3 rounded bg-light">
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" v-model="form.description" placeholder="Enter your expertise"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Experience (in years)</label>
              <input type="number" class="form-control" v-model="form.experience" />
            </div>
          </div>
        </transition>

        <button type="submit" class="btn btn-primary w-100 mt-3">Register</button>
      </form>
    </div>
  </div> 

       `,
  data() {
    return {
      form: {
        name: '',
        age: '',
        phone: '',
        email: '',
        role: 'customer',
        description: '',
        experience: '',
        password:''
      }
    };
  },
  methods: {
    async submitForm() {
        const apiUrl = "http://127.0.0.1:5000/customer/registration"; // Replace with your actual backend URL

        // Prepare request payload
        const payload = {
            customer_name: this.form.name,
            customer_age: this.form.age,
            customer_email: this.form.email,
            customer_phone: this.form.phone,
            customer_password: this.form.password,
            customer_role: this.form.role,
            customer_status: true, // Assuming the user is active by default
        };

        // If the user is a professional, include extra fields
        if (this.form.role === "professional") {
            payload.description = this.form.description;
            payload.experience = this.form.experience;
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registration successful!");
                console.log("Server response:", data);
            } else {
                alert("Error: " + data.error);
                console.error("Error response:", data);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Failed to connect to the server.");
        }
    }
   ,
    toggleRole() {
      if (this.form.role === 'customer') {
        this.form.description = '';
        this.form.experience = '';
      }
    }
  }
};
