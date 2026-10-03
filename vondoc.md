# **StudioLog Product Requirements Document**

**Version:** 1.2  
**Status:** Product draft  
**Product:** A logistics management platform for choosing services, arranging goods handling and transportation, consulting with a sales representative, paying, and tracking delivery.

## **1\. Product vision**

StudioLog gives customers one place to plan and manage a shipment. They can choose a service, describe their goods, get help from a sales representative, approve a clear plan and price, pay, and track the shipment through delivery.

## **2\. Recommended solution**

StudioLog should provide a guided shipment booking journey:

* Customers choose a logistics service and describe the goods they need transported.  
* LAS Transport Limited is presented as the primary logistics company. The admin can add other companies as options.  
* LAS Transport Limited handles the goods.  
* Transportation charges are based on shipment distance, using pricing directed by the admin.  
* Customers can book a phone or video consultation with a sales representative to confirm service, goods, shipment details, and price.  
* Before paying, customers see and approve a shipment plan that includes the selected service, goods, handling arrangement, distance, transportation charge, and expected timing.  
* After payment, customers follow shipment progress through clear status updates until delivery is complete.

This gives customers expert help where they need it while keeping the price and handling arrangement visible before they commit.

## **3\. Goals**

* Help customers select an appropriate logistics service.  
* Collect the information needed to plan transportation.  
* Make consultant booking straightforward.  
* Make distance-based transportation charges understandable.  
* Clearly identify LAS Transport Limited as the goods handler.  
* Let customers approve, pay for, and track a shipment in one place.

## **4\. Users**

There are two user groups:

**Customer:** An individual or business arranging transportation for goods.

**Admin:** Internal staff who manage and operate StudioLog. Admin is the only internal user group. Sales Representative / Consultant is a type of admin, not a separate user group. Admin accounts are assigned a role type that controls what they can do:

* **General Admin:** Manages the logistics companies offered to customers and directs the distance-based pricing. Keeps service and pricing information current.
* **Sales Representative / Consultant:** Helps the customer choose or confirm services, verifies shipment details, and presents the shipment plan and price. Can review the customer's service selection and shipment details before the consultation.
* **Operations:** Coordinates goods handling, pickup, transportation, delivery, and shipment updates.

## **5\. Customer journey**

1. The customer browses services and selects one, or asks for help choosing.  
2. The customer describes the goods, pickup and delivery locations, and timing needs.  
3. StudioLog presents LAS Transport Limited as the primary logistics company and any additional companies provided by the admin.  
4. The customer books a phone or video consultation.  
5. The sales representative / consultant (admin) confirms the service, handling needs, shipment details, distance, and price.  
6. StudioLog presents the complete shipment plan for customer review.  
7. The customer approves the plan and pays.  
8. LAS Transport Limited handles the goods, and the customer follows shipment updates in StudioLog.  
9. StudioLog confirms delivery and saves the shipment in the customer’s history.

Customers can save their progress and return later.

## **6\. Product requirements**

### **6.1 Service and company selection**

Customers can:

* Browse logistics services and understand what each includes.  
* Select a service or ask the sales representative / consultant (admin) to recommend one.  
* See LAS Transport Limited as the primary logistics company.  
* See other logistics companies added by the admin.  
* Review or change their selection before approving the shipment plan.

LAS Transport Limited is responsible for handling the goods. The shipment plan must state this clearly.

### **6.2 Goods and shipment details**

Customers provide:

* A description of the goods.  
* Quantity and, when needed, dimensions or weight.  
* Photos or other helpful details.  
* Special handling needs.  
* Pickup and delivery locations.  
* Preferred pickup or delivery timing.

StudioLog asks for essential details first and requests more information when it is needed to confirm the service or price. The sales representative / consultant (admin) can confirm or correct details during the appointment.

### **6.3 Distance-based charges**

Transportation charges are based on the distance covered. The admin directs the pricing used to calculate the charge.

StudioLog uses the customer’s pickup and delivery locations to determine the shipment distance. The proposed distance and transportation charge appear in the shipment plan. The sales representative / consultant (admin) confirms these details with the customer before approval.

### **6.4 Consultant booking**

Customers can:

* Choose an available appointment time.  
* Choose phone or video.  
* Add a short note about what they need help with.  
* Receive booking confirmation and reminders.  
* Reschedule or cancel under clearly stated rules.  
* Request a callback if no appointment time works.

The sales representative / consultant admin can review the customer’s service selection and shipment details before the consultation.

### **6.5 Shipment plan and approval**

The consultant (sales representative / consultant admin) confirms or recommends the service, logistics company, shipment details, distance, handling arrangement, expected timing, and price.

The customer-facing plan presents those details together, including:

* Selected logistics service.  
* Logistics company.  
* Goods and shipment details.  
* Confirmation that LAS Transport Limited handles the goods.  
* Distance used to calculate transportation charges.  
* Transportation charge and total price.  
* Expected timing and important conditions.

The customer can request corrections before approval. If the price or shipment details change, StudioLog presents the revised plan for customer review.

### **6.6 Admin management**

Admins with general admin access can:

* Set LAS Transport Limited as the primary logistics company.  
* Add or update other logistics companies offered to customers.  
* Direct distance-based transportation pricing.  
* Keep service and pricing information current.

### **6.7 Payment**

Customers review and approve the shipment plan before paying. StudioLog confirms the booking after payment succeeds.

If payment does not complete, StudioLog explains the next step and lets the customer retry or contact support.

### **6.8 Tracking**

Customers can see the current shipment status, progress timeline, latest update, and any action required from them.

Recommended milestones:

1. Booking confirmed  
2. Pickup scheduled  
3. Goods collected by LAS Transport Limited  
4. In transit  
5. Near destination  
6. Delivered  
7. Completed

Customers receive updates when a milestone changes, timing changes, or action is needed. Each update should explain what happened in plain language.

### **6.9 Completion and shipment history**

After delivery, customers can view delivery confirmation, the completion date, and the final shipment details. They can report an issue, contact support, and find completed shipments in their history.

## **7\. Core product rules**

* LAS Transport Limited is the primary logistics company shown to customers.  
* The admin can provide other logistics companies as additional options.  
* LAS Transport Limited handles the goods.  
* Transportation charges are based on distance using pricing directed by the admin.  
* Customers can request consultant help choosing a service.  
* Customers review and approve the shipment plan and price before payment.  
* Customers can track the shipment after booking.  
* Any changes to an approved plan or price require customer review.

## **8\. First release**

The first release should include:

* Service browsing and selection.  
* Goods and shipment detail entry.  
* LAS Transport Limited as the primary option, plus admin-provided company options.  
* Distance-based transportation charges directed by the admin.  
* Phone and video consultation booking.  
* Consultant confirmation of shipment details and price.  
* Customer approval and payment.  
* Shipment status updates through delivery.  
* Delivery confirmation, shipment history, and support contact.

## **9\. Success measures**

* Customers who complete a shipment request.  
* Requests that lead to attended consultations.  
* Consultations that lead to approved shipment plans.  
* Approved plans that are paid.  
* Time from request to paid booking.  
* Customer understanding of distance-based charges.  
* Timeliness of shipment updates.  
* Shipment delivery completion rate.  
* Customer satisfaction after delivery.  
* Support requests about service choice, price, goods handling, or tracking.

