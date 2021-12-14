$(document).ready(function () {
  const displayMessage = (response) => {
    if (response.success) {
      return swal({
        title: "Success",
        text: response.success,
        icon: "success",
        buttons: true,
      }).then((confirm) => {
        if (confirm) {
          location.reload();
        }
      });
    }

    if (response.error) {
      return swal({
        title: "Error",
        text: response.error,
        icon: "error",
        buttons: true,
      });
    }
  };
  let isUserUpdate = false;
  let userID = 0;
  let btnDeleteUsers = document.querySelectorAll("#btnDeleteUsers");
  let btnDownloadUserLog = document.querySelectorAll("#btnDownloadUserLog");
  let btnDeleteVehicle = document.querySelectorAll("#btnDeleteVehicle");
  let btnEditUsers = document.querySelectorAll("#btnEditUsers");
  let btnEditVehicle = document.querySelectorAll("#btnEditVehicle");
  let btnDeleteDepartment = document.querySelectorAll(".btnDeleteDepartment");
  let btnMakeVehicleAvailable = document.querySelectorAll(
    "#btnMakeVehicleAvailable"
  );

  //delete vehicles
  btnDownloadUserLog.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      var url = "\Users\JALLOH1629083\Node_apps\policePortal\log\access";
      e.preventDefault();
        
      document.location.href 
          = url;

      // swal({
      //   title: "Are you sure?",
      //   text: "If you delete this vehicle, all request related this vehicle would also be deleted",
      //   icon: "warning",
      //   buttons: true,
      //   dangerMode: true,
      // }).then((willDownload) => {
      //   if (willDownload) {
      //     $.ajax({
      //       url: `/admin/user-logs/download`,
      //       method: "GET",
      //       success: (response) => {
      //         displayMessage(response);
      //       },
      //       failure: (response) => {
      //         console.log(response);
      //       },
      //     });
      //   }
      // });
    });
  });



 

  //add new department
  $("#frmSaveDepartment").on("submit", (e) => {
    e.preventDefault();
    let errors = [];

    let form = $(this);
    let inputs = form.find(["input", "select", "textarea"]);

    //retrive data from the form being submitted
    const departmentName = $("#departmentName").val();

    if (departmentName === "") {
      errors.push("Enter department name");
    } else if (departmentName.length < 5 || departmentName.length > 50) {
      errors.push("Department name must be between 5 - 50 characters");
    }

    if (errors.length) {
      console.log(errors);
      return;
      // let html = "";

      // errors.forEach((error) => {
      //   html += `
      //       <div class="alert alert-danger alert-dismissible fade show" role="alert">
      //                           <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      //                               <span aria-hidden="true">&times;</span>
      //                               <span class="sr-only">Close</span>
      //                           </button>
      //                          <strong>${error}</strong>
      //                       </div>

      //   `;
      // });
      // document.getElementById("errorContainer").innerHTML = html;
      // return;
    }

    // inputs.props("disabled", true);
    //send request to the server to save the vehicle
    $.ajax({
      url: "/admin/departments",
      method: "POST",
      data: {
        departmentName,
      },
      success: (response) => {
        displayMessage(response);
      },
      failure: (response) => {
        console.log(response);
      },
    });
  });

  //assign department head
  $("#frmAssignDepartmentHead").on("submit", (e) => {
    e.preventDefault();
    let errors = [];

    let form = $(this);
    let inputs = form.find(["input", "select", "textarea"]);

    //retrive data from the form being submitted
    const departmentId = $("#departmentId").val();
    const hodId = $("#hodId").val();

    if (departmentId === "") {
      errors.push("Please select department");
    }

    if (hodId === "") {
      errors.push("Please select user");
    }

    if (errors.length) {
      console.log(errors);
      return;
      // let html = "";

      // errors.forEach((error) => {
      //   html += `
      //       <div class="alert alert-danger alert-dismissible fade show" role="alert">
      //                           <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      //                               <span aria-hidden="true">&times;</span>
      //                               <span class="sr-only">Close</span>
      //                           </button>
      //                          <strong>${error}</strong>
      //                       </div>

      //   `;
      // });
      // document.getElementById("errorContainer").innerHTML = html;
      // return;
    }

    // inputs.props("disabled", true);
    //send request to the server to save the vehicle
    $.ajax({
      url: "/admin/assign-hod",
      method: "POST",
      data: {
        departmentId,
        hodId,
      },
      success: (response) => {
        displayMessage(response);
      },
      failure: (response) => {
        console.log(response);
      },
    });
  });

  //saves new request
  $("#frmSubmitRequest").on("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    //retrive form values
    const departureDate = $("#departureDate").val();
    const returnDate = $("#returnDate").val();
    const tripPurpose = $("#tripPurpose").val();
    const numberOfPassengers = $("#numberOfPassengers").val();

    const today = moment(new Date()).format("DD/MM/YYYY");
    const dd = moment(new Date(departureDate)).format("DD/MM/YYYY");
    const rd = moment(new Date(returnDate)).format("DD/MM/YYYY");
    const dt = moment(departureDate).format("HH:mm A");
    const rt = moment(returnDate).format("HH:mm A");

    if (
      moment(dd, "DD/MM/YYYY", false).isBefore(
        moment(today, "DD/MM/YYYY", false)
      )
    ) {
      alert("Departure date must not be less than today");
      return;
    }

    if (
      moment(rd, "DD/MM/YYYY", false).isBefore(moment(dd, "DD/MM/YYYY", false))
    ) {
      alert("return date must not be less than departure date");
      return;
    }

    // let timeDifference = new Date(departureDate) - new Date();
    let timeDifference = moment(departureDate) - moment();

    const hourDiff = Math.ceil(timeDifference / 60 / 60 / 1000);

    if (tripPurpose === "Internal" && hourDiff < 2) {
      //provincial request should be sent 2 hours earlier before leaving
      alert(
        "all internal requests should be sent 2 hours ahead of departure time"
      );
      return;
    }
    if (tripPurpose === "Provincial" && hourDiff < 48) {
      //provincial request should be sent 2 hours earlier before leaving
      alert(
        "all provincial requests should be sent 48 hours ahead of departure time"
      );
      return;
    }

    $.ajax({
      url: "/call-logs/generate",
      method: "POST",
      data: {                               
        callStartDate: csd,
        callStartTime: cst,
        iMEI : imei,
        accessMethodIdentifier: ami,
        callDuration,
        callOriginatingNumber,
        callTerminatingNumber,
        Zone, 
        Site 
      },
      success: (response) => {
        console.log(response);
        displayMessage(response);
      },
      failure: (response) => {
        console.log(response);
      },
    });
  });

  //sends filter resquest
  $("#frmReportFilter").on("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();


    $.ajax({
      url: `/admin/report?`,
      method: "GET",
      success: (response) => {
        const { data } = response;
        let tr = "";
        data.forEach((d) => {
          tr += `
              <tr>
                <td scope="col" class="text-center">
                                                  ${d.callStartDate}
                                            </td>
                                          <td scope="col" class="text-cented">
                                              ${d.callStartTime}
                                          </td>
                                          <td scope="col" class="text-center">
                                              ${d.iMEI} 
                                          </td>
                                          <td scope="col" class="text-center">
                                              ${d.accessMethodIdentifier} 
                                          </td> 
                                          <td scope="col" class="text-center">
                                              ${d.callDuration} 
                                          </td>
                                          <td scope="col" class="text-center">
                                              ${d.callOriginatingNumber}
                                          </td>
                                          <td scope="col" class="text-center">
                                              ${d.callTerminatingNumber} 
                                          </td>
                                          <td scope="col" class="text-center">
                                              ${d.Zone} 
                                          </td>
                                          <td scope="col" class="text-center">
                                              ${d.Site} 
                                          </td> 
              </tr>
            `;
        });

        document.getElementById("filterResult").innerHTML = "";
        document.getElementById("filterResult").innerHTML = tr;
      },
      failure: (response) => {
        console.log(response);
      },
    });
  });

 
  $("#tblCallLogs").DataTable({
    dom: "Bfrtip",
    buttons: ["excelHtml5", "csv"],
  });
})
