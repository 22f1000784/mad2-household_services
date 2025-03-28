export default{
    template:`<div><div class="container mt-4">
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <!-- Left: Home Link -->
      

      <!-- Right: Logout Button -->
      <button class="btn btn-danger btn-sm ms-auto" @click="logout">Logout</button>
    </div>
  </nav>

    <h2 class="mb-3 text-center">Service Requests</h2>

    <div v-if="serviceRequests.length > 0">
      <div v-for="request in serviceRequests" :key="request.id" class="card mb-3 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">{{ request.service.name }}</h5>
          <p class="card-text"><strong>Description:</strong> {{ request.service.Description }}</p>

          <div class="row">
            <div class="col-md-6 col-sm-12">
              <p><strong>Price:</strong> ₹{{ request.service.price }}</p>
              <p><strong>Time Required:</strong> {{ request.service.time_required }} hrs</p>
            </div>
            <div class="col-md-6 col-sm-12">
              <p><strong>Status:</strong> 
                <span class="badge" :class="getStatusClass(request.service_status)">
                  {{ request.service_status }}
                </span>
              </p>
            </div>
          </div>

          <hr>

          <h6>Customer Details</h6>
          <div class="row">
            <div class="col-md-4 col-sm-12">
              <p><strong>Name:</strong> {{ request.customer.name }}</p>
            </div>
            <div class="col-md-4 col-sm-12">
              <p><strong>Age:</strong> {{ request.customer.age }}</p>
            </div>
            <div class="col-md-4 col-sm-12">
              <p><strong>Phone:</strong> {{ request.customer.phone }}</p>
            </div>
          </div>

          <hr>

          <!-- Show Accept/Reject buttons if status is pending -->
          <div v-if="request.service_status === 'Pending'" class="d-flex flex-wrap gap-2">
            <button class="btn btn-success btn-sm flex-grow-1" @click="acceptRequest(request.id)">Accept</button>
            <button class="btn btn-danger btn-sm flex-grow-1" @click="rejectRequest(request.id)">Reject</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center">
      <p>No service requests available.</p>
    </div>
  </div></div>`,
    data() {
        return {
          serviceRequests: [], // Array to store fetched service requests
        };
      },
      methods: {
        getStatusClass(status) {
            switch (status) {
              case 'pending': return 'bg-warning text-dark';
              case 'accepted': return 'bg-success';
              case 'rejected': return 'bg-danger';
              case 'completed': return 'bg-primary';
              default: return 'bg-secondary';
            }
          },

        async fetchProfessionalRequests() {
          try {
            const response = await fetch('/proffesional/service-requests', {
              headers: {
                "Authentication-Token": localStorage.getItem('token'),
                "Content-Type": "application/json"
              }
            });
      
            const data = await response.json();
      
            if (response.ok) {
              this.serviceRequests = data; // Store the fetched requests in the array
              console.log(this.serviceRequests)
            } else {
              console.error("Error fetching service requests:", data.message);
              alert(`Error: ${data.message}`);
            }
          } catch (error) {
            console.error("Network error:", error);
            alert("Failed to connect to the server.");
          }
        },
        logout() {
            localStorage.clear(); // Clear authentication token
            this.$router.push("/login"); // Redirect to login page
          },
          async acceptRequest(requestId) {
            try {
                const response = await fetch(`/accept_request/${requestId}`, {
                    method: "POST",
                    headers: {
                        "Authentication-Token": localStorage.getItem("token"),
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({}),
                });
        
                const data = await response.json();
        
                if (response.ok) {
                    alert("Service request accepted successfully!");
                    location.reload();
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error("Network error:", error);
                alert("Failed to connect to the server.");
            }
          },
          async rejectRequest(requestId) {
            try {
                const response = await fetch(`/reject_request/${requestId}`, {
                    method: "POST",
                    headers: {
                        "Authentication-Token": localStorage.getItem("token"),
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({}),
                });
        
                const data = await response.json();
        
                if (response.ok) {
                    alert("Service request rejected successfully!");
                    location.reload();
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error("Network error:", error);
                alert("Failed to connect to the server.");
            }
          },
        },
    
      mounted() {
        this.fetchProfessionalRequests(); // Fetch requests when the component is loaded
      }
}