from celery import shared_task
from datetime import datetime,timedelta
from jinja2 import Template
from models import db, Service_request, User, Proffessional, Service
from mail_service import send_email
from sqlalchemy.orm import joinedload
import pdfkit  # Install with `pip install pdfkit`
import os
import flask_excel as excel
import pyexcel

REPORTS_DIR = "generated_reports"
os.makedirs(REPORTS_DIR, exist_ok=True) 



@shared_task
def generate_csv():
    """Generate CSV of closed service requests."""
    filename = f"closed_services_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.csv"
    file_path = os.path.join(REPORTS_DIR, filename)

    # Fetch closed service requests
    closed_services = Service_request.query.filter_by(service_status="completed").all()
    
    # Convert data to CSV format
    data = [["Service ID", "Customer ID", "Professional ID", "Request Date", "Remarks"]]
    for service in closed_services:
        data.append([
            service.service_id,
            service.customer_id,
            service.proffesional_id,
            service.date_of_request,
            service.remarks
        ])

    # Save as CSV
    pyexcel.save_as(array=data, dest_file_name=file_path)
    return file_path


@shared_task
def send_reminder_emails():
    
    pending_requests = Service_request.query.filter_by(service_status="Pending").all()

    for request in pending_requests:
            professional = Proffessional.query.get(request.proffesional_id)
            if professional and professional.user:
                recipient_email = professional.user.email
                subject = "Reminder: Pending Service Request"
                message = f"""
                <html>
                <body>
                    <p>Dear {professional.user.name},</p>
                    <p>You have a pending service request. Please visit the Household Service app and take action.</p>
                    <p>Thank you.</p>
                </body>
                </html>
                """
                send_email(to_address=recipient_email, subject=subject, message=message, content="html")
    
    
    return f"Sent reminders to {len(pending_requests)} professionals."

@shared_task
def send_test_report():
    pdf_filename = generate_monthly_report(target_month=3)
    send_email(to_address="admin@company.com", subject="March Report", message="Attached March report.", attachment_file=pdf_filename)
    os.remove(pdf_filename)



@shared_task
def send_monthly_report():
    """Fetch customer service requests, generate a report, and send it via email."""

    customers = db.session.query(User).all()

    for customer in customers:
        service_requests = (
            db.session.query(Service_request)
            .join(Service)  # Join to fetch service details
            .filter(Service_request.customer_id == customer.id)
            .all()
        )

        total_requested = len(service_requests)
        closed_services = sum(1 for req in service_requests if req.service_status.lower() == "completed")

        if total_requested == 0:
            continue  # Skip users with no service requests

        # **Generate Report Using Jinja2**
        report_template = """
        <html>
        <body>
            <h2>Monthly Service Report - {{ month }}</h2>
            <p>Dear {{ customer_name }},</p>
            <p>Here is your monthly service activity report:</p>
            
            <table border="1" cellpadding="5">
                <tr>
                    <th>Total Requests</th>
                    <th>Completed Services</th>
                    <th>Pending Services</th>
                </tr>
                <tr>
                    <td>{{ total_requested }}</td>
                    <td>{{ closed_services }}</td>
                    <td>{{ total_requested - closed_services }}</td>
                </tr>
            </table>

            <h3>Service Details</h3>
            <table border="1" cellpadding="5">
                <tr>
                    <th>Service ID</th>
                    <th>Service Name</th>
                    <th>Date of Request</th>
                    <th>Date of Completion</th>
                    <th>Status</th>
                    <th>Remarks</th>
                </tr>
                {% for service in service_requests %}
                <tr>
                    <td>{{ service.id }}</td>
                    <td>{{ service.service.name if service.service else 'Unknown' }}</td>
                    <td>{{ service.date_of_request.strftime('%d-%m-%Y') if service.date_of_request else 'N/A' }}</td>
                    <td>{{ service.date_of_completion.strftime('%d-%m-%Y') if service.date_of_completion else 'Pending' }}</td>
                    <td>{{ service.service_status }}</td>
                    <td>{{ service.remarks if service.remarks else 'No remarks' }}</td>
                </tr>
                {% endfor %}
            </table>

            <br>
            <p>Thank you for using our service!</p>
        </body>
        </html>
        """
        
        template = Template(report_template)
        email_body = template.render(
            month=datetime.now().strftime("%B %Y"),
            customer_name=customer.name,
            total_requested=total_requested,
            closed_services=closed_services,
            service_requests=service_requests
        )

        # **Send email**
        send_email(
            to_address=customer.email,
            subject=f"Monthly Service Report - {datetime.now().strftime('%B %Y')}",
            message=email_body
        )

    return "Monthly reports sent successfully!"