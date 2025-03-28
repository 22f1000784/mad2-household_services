export default{
    template:`<div>
    <div class="container mt-4">
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <!-- Left Side - Home Link -->
      <router-link to="/customer" class="navbar-brand">Home</router-link>

      <!-- Right Side - Logout Button -->
      <button class="btn btn-outline-light ms-auto" @click="logout">
        Logout
      </button>
    </div>
  </nav>
  <h3 class="text-primary text-center">Service Requests</h3>
  
  <div v-if="serviceRequests.length === 0" class="alert alert-warning text-center">
    No service requests found.
  </div>

  <div v-else class="row">
    <div v-for="request in serviceRequests" :key="request.id" class="col-md-6 col-lg-4">
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <h5 class="card-title text-success">{{ request.service.name }}</h5>
          <p class="card-text">
            <strong>Remarks:</strong> {{ request.remarks }} <br>
            <strong>Description:</strong> {{ request.service.Description }} <br>
            <strong>Price:</strong> ₹{{ request.service.price }} <br>
            <strong>Time Required:</strong> {{ request.service.time_required }} hrs <br>
            <strong>Status:</strong> 
            <span :class="getStatusClass(request.service_status)">
              {{ request.service_status }}
            </span>
          </p>
          <button v-if="request.service_status === 'accepted'" class="btn btn-danger btn-sm" @click="toggleCloseRequest(request.id)">
            Close Request
          </button>

          <!-- Input Field for Remarks (Shown when closing request) -->
          <div v-if="closingRequestId === request.id" class="mt-2">
            <textarea v-model="remarks" class="form-control mb-2" placeholder="Enter remarks"></textarea>
            <button class="btn btn-primary btn-sm" @click="submitCloseRequest(request.id)">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    </div>`,
    mounted(){
        this.fetchservice_request();
    },

    data(){
        return{
            serviceRequests:[], 
            closingRequestId: null, // Stores the request ID that is being closed
            remarks: "", // Stores user remarks
        }
    },
    methods:{
        logout() {
            localStorage.removeItem("token"); // Clear stored token
            this.$router.push("/login"); // Redirect to login page
          },
        async fetchservice_request() {
            try {
                const response = await fetch("/all_service_requests", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });
        
                const data = await response.json();
        
                if (response.ok) {
                    this.serviceRequests = data; // Store the fetched data
                    console.log("Service requests fetched:", this.serviceRequests);
                } else {
                    alert(`Error: ${data.message}`);
                    console.error("Error response:", data);
                }
            } catch (error) {
                console.error("Network error:", error);
                alert("Failed to fetch service requests.");
            }
        },
        getStatusClass(status) {
            switch (status.toLowerCase()) {
              case "pending":
                return "badge bg-warning text-dark";
              case "completed":
                return "badge bg-success";
              case "in progress":
                return "badge bg-info";
              default:
                return "badge bg-secondary";
            }
          },
          toggleCloseRequest(requestId) {
            this.closingRequestId = requestId;
            this.remarks = "";
          },
        
          async submitCloseRequest(requestId) {
            if (!this.remarks.trim()) {
              alert("Please enter remarks before closing the request.");
              return;
            }
        
            try {
              const response = await fetch(`/close_request/${requestId}`, {
                method: "POST",
                headers: {
                  "Authentication-Token": localStorage.getItem("token"),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ remarks: this.remarks }),
              });
        
              const data = await response.json();
        
              if (response.ok) {
                alert("Service request closed successfully!");
                this.serviceRequests = this.serviceRequests.map(req => 
                  req.id === requestId ? { ...req, service_status: "completed" } : req
                );
                this.closingRequestId = null;
              } else {
                alert(`Error: ${data.error}`);
              }
            } catch (error) {
              console.error("Network error:", error);
              alert("Failed to connect to the server.");
            }
          }
    }

}