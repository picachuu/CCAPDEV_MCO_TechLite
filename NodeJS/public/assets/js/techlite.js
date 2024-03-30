// // whether user is logged
// var logged = true;
// // user information
// var username = "admin";
// var email = "admin@email.com";
// var img_url = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
// var banner_url = "https://cdn.pixabay.com/photo/2022/03/17/11/17/bootleg-7074375_960_720.jpg";
// var bio_msg = 'Admin of the TechLite: "I dunno but apdev kinda tuf innit"';
// var is_manager = true;

// whether user is logged
var logged = getLogged();
// user information
var username = getUsername();
var email = getEmail();
var img_url = getImgUrl();
var banner_url = getBannerUrl();
var bio_msg = getBioMsg();
var is_manager = getIsManager();

// don't know how to make it asynchronous yet, should not even need these when cookies and sessions are introduced
function getUserData() {
    let response = $.ajax({
        url: 'obtain-credentials',
        type: 'POST',
        async: false  // Make the AJAX request synchronous
    }).responseJSON;

    if (response.logged) {
        let userObject = response.user;
        return {
            logged: true,
            username: userObject.username,
            email: userObject.email,
            img_url: userObject.img_url,
            banner_url: userObject.banner_url,
            bio_msg: userObject.bio_msg,
            is_manager: userObject.is_manager
        };
    } else {
        return {
            logged: false,
            username: null,
            email: null,
            img_url: null,
            banner_url: null,
            bio_msg: null,
            is_manager: null
        };
    }
}

function getLogged() {
    return getUserData().logged;
}

function getUsername() {
    return getUserData().username;
}

function getEmail() {
    return getUserData().email;
}

function getImgUrl() {
    return getUserData().img_url;
}

function getBannerUrl() {
    return getUserData().banner_url;
}

function getBioMsg() {
    return getUserData().bio_msg;
}

function getIsManager() {
    return getUserData().is_manager;
}

(function ($) {
	
	"use strict";

	$(window).on('load', function() {

        $('#js-preloader').addClass('loaded');

    });

	$(window).on ('load', function (){
        if ($(".wow").length) { 
            var wow = new WOW ({
                boxClass:     'wow',     
                animateClass: 'animated', 
                offset:       20,        
                mobile:       true,       
                live:         true,       
            });
            wow.init();
        }
    });

	$(window).scroll(function() {
	  var scroll = $(window).scrollTop();
	  var box = $('.header-text').height();
	  var header = $('header').height();

	  if (scroll >= box - header) {
	    $("header").addClass("background-header");
	  } else {
	    $("header").removeClass("background-header");
	  }
	});
	
	$('.filters ul li').click(function(){
        $('.filters ul li').removeClass('active');
        $(this).addClass('active');
          
          var data = $(this).attr('data-filter');
          $grid.isotope({
            filter: data
          })
        });

        var $grid = $(".grid").isotope({
          	itemSelector: ".all",
          	percentPosition: true,
          	masonry: {
            columnWidth: ".all"
        }
    })

	var width = $(window).width();
		$(window).resize(function() {
			if (width > 992 && $(window).width() < 992) {
				location.reload();
			}
			else if (width < 992 && $(window).width() > 992) {
				location.reload();
			}
	})



	$(document).on("click", ".naccs .menu div", function() {
		var numberIndex = $(this).index();
	
		if (!$(this).is("active")) {
			$(".naccs .menu div").removeClass("active");
			$(".naccs ul li").removeClass("active");
	
			$(this).addClass("active");
			$(".naccs ul").find("li:eq(" + numberIndex + ")").addClass("active");
	
			var listItemHeight = $(".naccs ul")
				.find("li:eq(" + numberIndex + ")")
				.innerHeight();
			$(".naccs ul").height(listItemHeight + "px");
		}
	});

	$('.owl-features').owlCarousel({
		items:3,
		loop:true,
		dots: false,
		nav: true,
		autoplay: true,
		margin:30,
		responsive:{
			  0:{
				  items:1
			  },
			  600:{
				  items:2
			  },
			  1200:{
				  items:3
			  },
			  1800:{
				items:3
			}
		}
	})

	$('.owl-collection').owlCarousel({
		items:3,
		loop:true,
		dots: false,
		nav: true,
		autoplay: true,
		margin:30,
		responsive:{
			  0:{
				  items:1
			  },
			  800:{
				  items:2
			  },
			  1000:{
				  items:3
			}
		}
	})

	$('.owl-banner').owlCarousel({
		items:1,
		loop:true,
		dots: false,
		nav: true,
		autoplay: true,
		margin:30,
		responsive:{
			  0:{
				  items:1
			  },
			  600:{
				  items:1
			  },
			  1000:{
				  items:1
			}
		}
	})

	
	
	

	// Menu Dropdown Toggle
	if($('.menu-trigger').length){
		$(".menu-trigger").on('click', function() {	
			$(this).toggleClass('active');
			$('.header-area .nav').slideToggle(200);
		});
	}


	// Menu elevator animation
	$('.scroll-to-section a[href*=\\#]:not([href=\\#])').on('click', function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			if (target.length) {
				var width = $(window).width();
				if(width < 991) {
					$('.menu-trigger').removeClass('active');
					$('.header-area .nav').slideUp(200);	
				}				
				$('html,body').animate({
					scrollTop: (target.offset().top) - 80
				}, 700);
				return false;
			}
		}
	});

    

	$(document).ready(function () {
	    $(document).on("scroll", onScroll);


        // Check if the user is not logged in
        if (!logged) {
            // hide navigation bar profile image and button, id = navbarProfileImage, navbarProfile
            document.getElementById('navbarProfileImage').style.display = 'none';
            document.getElementById('navbarProfile').style.display = 'none';
        }
        // Check if the user is logged in
        if (logged) {
            // hide login button, id = loginBtn
            document.getElementById('loginBtn').style.display = 'none';
        }

        // Check if the navbarProfileImage exists, and replace with user image accordingly
        let navbarProfileImage = document.getElementById('navbarProfileImage');
        if (navbarProfileImage) {   
            navbarProfileImage.src = img_url;
        }

        // Change behavior based on user role
        if (is_manager) {
            document.getElementById('navbarReserve').innerText = "Reservations";
        }
        
        // To execute this code only when user is on the / page
        if (window.location.pathname === '/') {
            document.getElementById('navbarHome').classList.add('active');

            // Check if a tier is available and update the main redirect buttons accordingly
            let htmlText;
            for (let i = 1; i <= 3; i++) { (async function(){// asynchronous operation function since isTierAvailable is an asynchronous function
                if (await isTierAvailable(i)) { // waits for the isTierAvailable function to return a value
                    htmlText = `<a href="reserve?tier=${i}">Reserve</a>`;   // Make the button redirect to the reserve page with the tier number
                } else {
                    htmlText = '<a href="#">All Slots Full</a>';    // Make the button without a redirect
                    document.getElementById(`tier${i}MainBtn`).classList.add('border-no-active');   // Add a class to make the button look inactive (gray)
                }
                document.getElementById(`tier${i}MainBtn`).innerHTML = htmlText;    // Update the buttons with the new html (buttons)
            })();// <-- parentheses to call the function immediately (the async operation)
            }
        }

        // To execute this code only when user is on the /reserve page
        if (window.location.pathname === '/reserve') {
            document.getElementById('navbarReserve').classList.add('active');

            // Check if receives a redirect from a tier button
            let urlParams = new URLSearchParams(window.location.search);
            for (let i = 1; i <= 3; i++) {
                if (urlParams.has('tier') && urlParams.get('tier') == i) {
                    // The page was redirected from the button with id 'tier i' and default the select to that tier
                    document.getElementById('tierSelect').value = `tier${i}`;
                }
            }  

            if (is_manager){ // if manager, then allow to edit fields
                document.querySelector('div.reservation-form-fields-container input[name="name"]').readOnly = false;
                document.querySelector('div.reservation-form-fields-container input[name="email"]').readOnly = false;
            }

            // Check if the user is not logged in
            if (!logged) {
                // hide and disable input reservation fields
                document.querySelector('div.reservation-form-fields-container input[name="name"]').disabled = true;
                document.querySelector('div.reservation-form-fields-container input[name="email"]').disabled = true;
                $('.reservation-form-fields-container').hide();
            }
        }

        // To execute this code only when user is on the /search page
        if (window.location.pathname === '/search') {
            document.getElementById('navbarSearch').classList.add('active');
        }

        // To execute this code only when user is on the /services page
        if (window.location.pathname === '/services') {
            document.getElementById('navbarServices').classList.add('active');
        }

        // To execute this code only when user is on the /profile page
        if (window.location.pathname === '/profile') {
            // if the user is not logged and visits /profile, redirect to home page
            if (!logged) {
                window.location.href = '/';
                return;
            }

            document.getElementById('navbarProfile').classList.add('active');
            document.getElementById('coverBannerContainer').style.backgroundImage = 'url(' + banner_url + ')';
            document.getElementById('profileImage').src = img_url;
            document.getElementById('userName').innerText = username;
            document.getElementById('userBio').innerText = bio_msg;
            let role = "Member";
            if (is_manager) {
                role = "Manager";
            } 
            document.getElementById('roleTag').innerText = role;
        }

        // To execute this code only when user is on the /manage page
        if (window.location.pathname === '/manage') {
            // if the user is not logged and visits /profile, redirect to home page
            if (!logged) {
                window.location.href = '/';
                return;
            }
        }

        
	    
	    //smoothscroll
	    $('.scroll-to-section a[href^="#"]').on('click', function (e) {
	        e.preventDefault();
	        $(document).off("scroll");
	        
	        $('.scroll-to-section a').each(function () {
	            $(this).removeClass('active');
	        })
	        $(this).addClass('active');
	      
	        var target = this.hash,
	        menu = target;
	       	var target = $(this.hash);
	        $('html, body').stop().animate({
	            scrollTop: (target.offset().top) - 79
	        }, 500, 'swing', function () {
	            window.location.hash = target;
	            $(document).on("scroll", onScroll);
	        });
	    });


        // Within /profile page
        let logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            $('#logoutBtn').on('click', function(event) {
                event.preventDefault(); // Prevent default anchor behavior

                // ==== Placeholder: Logic to logout user ====
                alert('Logging out...');
                $.post('/log-out'); //kinda weird but it works
                window.location.href = '/'; // Redirect to home page
            });
        }

	}); // $(document).ready end

    // Function to check if a tier is available
    async function isTierAvailable(tierNumber) {
        let isAvailable = false;
        await $.ajax({
            url: 'tier-slots',
            type: 'POST',
            data: { tier_num: tierNumber},
            async: true,  // Make the request synchronous
            success: function(data, status) {
                if (status === 'success') {
                    isAvailable = data.isAvail;
                }
            },
            error: function() {
                //no errors :)
            }
        });
        
        return isAvailable;
        //return isUnavailable;
    }

	function onScroll(event){
	    var scrollPos = $(document).scrollTop();
	    $('.nav a').each(function () {
	        var currLink = $(this);
	        var refElement = $(currLink.attr("href"));
	        if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
	            $('.nav ul li a').removeClass("active");
	            currLink.addClass("active");
	        }
	        else{
	            currLink.removeClass("active");
	        }
	    });
	}


	// Page loading animation
	$(window).on('load', function() {
		if($('.cover').length){
			$('.cover').parallax({
				imageSrc: $('.cover').data('image'),
				zIndex: '1'
			});
		}

		$("#preloader").animate({
			'opacity': '0'
		}, 600, function(){
			setTimeout(function(){
				$("#preloader").css("visibility", "hidden").fadeOut();
			}, 300);
		});
	});

	

	const dropdownOpener = $('.main-nav ul.nav .has-sub > a');

    // Open/Close Submenus
    if (dropdownOpener.length) {
        dropdownOpener.each(function () {
            var _this = $(this);

            _this.on('tap click', function (e) {
                var thisItemParent = _this.parent('li'),
                    thisItemParentSiblingsWithDrop = thisItemParent.siblings('.has-sub');

                if (thisItemParent.hasClass('has-sub')) {
                    var submenu = thisItemParent.find('> ul.sub-menu');

                    if (submenu.is(':visible')) {
                        submenu.slideUp(450, 'easeInOutQuad');
                        thisItemParent.removeClass('is-open-sub');
                    } else {
                        thisItemParent.addClass('is-open-sub');

                        if (thisItemParentSiblingsWithDrop.length === 0) {
                            thisItemParent.find('.sub-menu').slideUp(400, 'easeInOutQuad', function () {
                                submenu.slideDown(250, 'easeInOutQuad');
                            });
                        } else {
                            thisItemParent.siblings().removeClass('is-open-sub').find('.sub-menu').slideUp(250, 'easeInOutQuad', function () {
                                submenu.slideDown(250, 'easeInOutQuad');
                            });
                        }
                    }
                }

                e.preventDefault();
            });
        });
    }

})(window.jQuery);






/* Search */
function showSearchForm(option) {
    document.getElementById('searchMemberForm').style.display = 'none';
    document.getElementById('searchSeatsForm').style.display = 'none';
    document.getElementById('availableSeats').style.display = 'none'; // Add this line

    if (option === 'member') {
        document.getElementById('searchMemberForm').style.display = 'block';
    } else if (option === 'seats') {
        document.getElementById('searchSeatsForm').style.display = 'block';
        document.getElementById('availableSeats').style.display = 'block'; // Display available seats for this option
    }
}

function showForm() {
    document.getElementById('reservationForm').style.display = 'block';
}

function submitMemberSearch() {
    // Implement the logic to search for a member by name or ID.
    // This is a placeholder function. 
    alert('Searching for member...');
}

function submitSeatSearch() {
    // Implement the logic to search for available seats by time slot.
    // This is a placeholder function.
    alert('Searching for available seats...');
}
function filterSeatsByTime() {
    const time = document.getElementById('timeInput').value;
    if (!time) {
        alert("Please select a time to search for available seats.");
        return;
    }

    // Placeholder: Logic to fetch available seats based on time
    // This could involve fetching data from a server
    // For demonstration, we'll simulate with static data

    // Simulate fetching available seats for all tiers
    showAvailableSeats();
}

function showAvailableSeats() {
    const seatsContainer = document.getElementById('availableSeats');
    seatsContainer.innerHTML = ''; // Clear previous results

    // Simulate displaying seats for Tier 1 to Tier 3
    ['tier1', 'tier2', 'tier3'].forEach(tier => {
        const tierDiv = document.createElement('div');
        tierDiv.classList.add('tier');
        const title = document.createElement('h3');
        title.textContent = `Available Seats (${tier.toUpperCase()})`;
        tierDiv.appendChild(title);

        // Populate tier with example seats (modify as needed)
        for (let i = 1; i <= 5; i++) { // Example: 5 seats per tier
            const seat = document.createElement('button');
            seat.textContent = `Seat ${i}`;
            seat.classList.add('seat', 'available');
            seat.onclick = function() {
                showForm(); // Function to show the reservation form
            };
            tierDiv.appendChild(seat);
        }

        seatsContainer.appendChild(tierDiv);
    });
}

function showForm() {
    // Show the reservation form similar to the reserve.html functionality
    document.getElementById('reservationForm').style.display = 'block';
}

/* Service */


document.addEventListener("DOMContentLoaded", function() {
    const serviceContent = document.getElementById("serviceContent");

    document.getElementById("printFile").addEventListener("click", function() {
        serviceContent.innerHTML = `
        <div class="print-file" id="printFile">
            <h2>Print a File</h2>
            <p>Select your file to print:</p>
            <div class="file-drop-area">
                <span class="fake-btn">Choose files</span>
                <span class="file-msg">or drag and drop files here</span>
                <input class="file-input" type="file" multiple></input>
            </div>
            <button class = "submit-btn" onclick="alert('File submitted for printing')">Submit</button>
        </div>
        `;
    });



    document.getElementById("orderFood").addEventListener("click", function() {
        serviceContent.innerHTML = `
            <div class = "food-order">
            <h2>Order Food</h2>
            <p>Select items to order:</p>
            <div class="food-menu">
                <div class="food-item">
                    <img src="assets/images/Pancit_canton.png" alt="Pancit Canton">
                    <label><input type="checkbox" name="food" value="Pancit Canton - P50"> Pancit Canton - P50</label>
                </div>
                <div class="food-item">
                    <img src="assets/images/shin-cup.png" alt="Shin Ramyun">
                    <label><input type="checkbox" name="food" value="Shin Ramyun - P100"> Shin Ramyun - P100</label>
                </div>
                <div class="food-item">
                    <img src="assets/images/pizza.png" alt="Pepperoni Pizza">
                    <label><input type="checkbox" name="food" value="Pepperoni Pizza - P120"> Pepperoni Pizza - P120</label>
                </div>
                <div class="food-item">
                    <img src="assets/images/coke.webp" alt="Coke">
                    <label><input type="checkbox" name="food" value="Coke - P70"> Coke - P70</label>
                </div>
                <div class="food-item">
                    <img src="assets/images/water.webp" alt="Water">
                    <label><input type="checkbox" name="food" value="Water - P50"> Water - P50</label>
                </div>
            </div>
            <button type="button" class="food-submit-btn">Order</button>
            </div>
        `;
    });
    

    document.getElementById("litecoinShop").addEventListener("click", function() {
        serviceContent.innerHTML = `
        <div class="litecoin-shop" id="litecoinShop">
            <h2>Litecoin Shop</h2>
            <p>Use your litecoins to purchase rewards:</p>
            <form id="litecoinShopForm" class="litecoin-shop-form">
                <label class="litecoin-option">
                    <input type="radio" name="reward" value="100 Litecoins for $10 Credit">
                    <span>100 Litecoins for P1000 Credit</span>
                </label>
                <label class="litecoin-option">
                    <input type="radio" name="reward" value="200 Litecoins for $25 Credit">
                    <span>200 Litecoins for P2000 Credit</span>
                </label>
                <label class="litecoin-option">
                    <input type="radio" name="reward" value="500 Litecoins for $70 Credit">
                    <span>500 Litecoins for P5000 Credit</span>
                </label>
            <button type="button" class="litecoin-submit-btn">Purchase</button>
            </form>
        </div>
        `;
    });
});

document.addEventListener("DOMContentLoaded", function() {
    var fileInput = document.querySelector(".file-input");
    var dropArea = document.querySelector(".file-drop-area");
    var fileMsg = document.querySelector(".file-msg");

    dropArea.addEventListener("dragover", function(e) {
        e.preventDefault();
        dropArea.classList.add("active");
        fileMsg.textContent = "Release to upload files";
    });

    dropArea.addEventListener("dragleave", function(e) {
        dropArea.classList.remove("active");
        fileMsg.textContent = "or drag and drop files here";
    });

    dropArea.addEventListener("drop", function(e) {
        e.preventDefault();
        dropArea.classList.remove("active");
        fileInput.files = e.dataTransfer.files;
        // Assuming you want to list the file names
        var filesList = Array.from(e.dataTransfer.files).map(file => file.name).join(", ");
        fileMsg.textContent = filesList || "or drag and drop files here";
    });

    fileInput.addEventListener("change", function() {
        // Assuming you want to list the file names
        var filesList = Array.from(fileInput.files).map(file => file.name).join(", ");
        fileMsg.textContent = filesList || "or drag and drop files here";
    });
});


function submitOrder() {
    const selectedItems = document.querySelectorAll('#foodOrderForm input[name="food"]:checked');
    const selectedValues = Array.from(selectedItems).map(item => item.value);
    if (selectedValues.length > 0) {
        alert('Order successfully placed for: ' + selectedValues.join(', '));
    } else {
        alert('No items selected. Please select at least one item to order.');
    }
}

function purchaseReward() {
    const selectedReward = document.querySelector('#litecoinShopForm input[name="reward"]:checked');
    if (selectedReward) {
        alert(`Reward successfully purchased: ${selectedReward.value}`);
    } else {
        alert('No reward selected. Please select a reward to purchase.');
    }
}

// Function to toggle popups
function togglePopup(popup) {
    if (popup.style.display === "block") {
        popup.style.display = "none";
    } else {
        popup.style.display = "block";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    let loginBtn = document.getElementById('loginBtn');
    let loginPopup = document.getElementById('loginPopup');
    let createAccountPopup = document.getElementById('createAccountPopup');
    let confirmationPopup = document.getElementById('confirmationPopup');
    let closeBtns = document.querySelectorAll('.login-popup .close, .create-account-popup .close');
    let createAccountLink = document.getElementById('createAccountLink');
    let loginLink = document.getElementById('loginLink');
    let forms = document.querySelectorAll('form');

    // Show the login popup when login button is clicked
    if(loginBtn) {
        loginBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior
            togglePopup(loginPopup);
        });
    }

    // Close popups when close button is clicked
    closeBtns.forEach(function(btn) {
        btn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior
            togglePopup(this.closest('.login-popup') || this.closest('.create-account-popup') || this.closest('.confirmation-popup'));
            
            // clears the form within the popup div when close button is clicked
            // Find the closest div and then find the form within that div
            let closestDiv = this.closest('div');
            if (closestDiv) {
                let formInClosestDiv = closestDiv.querySelector('form');
                // Reset the form if it exists
                if (formInClosestDiv) {
                    formInClosestDiv.reset();
                }
            }
        });
    });
    

    // Show the create account popup when "Create here" is clicked
    createAccountLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor behavior
        togglePopup(loginPopup); // Close the login popup
        togglePopup(createAccountPopup); // Open the create account popup
    });

    loginLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor behavior
        togglePopup(createAccountPopup); // Close the create account popup
        togglePopup(loginPopup); // Open the login popup
    });

    //Reservation page form confirmation popup handler
    let reservationForm = document.forms["reservationForm"];
    if (reservationForm) {
        let submitBool = false;
        let h4Element = document.querySelector('#confirmationPopup h4');

        // Add an event listener for the form's submit event
        reservationForm.addEventListener('submit', function(event) {
            // Prevent the form from being submitted
            event.preventDefault();

            submitBool = true;

            if (logged) {// Show the popup confirmation
                // Replace the HTML of the h4 element
                h4Element.innerHTML = 'Confirm Reservation';
                // Show the confirmation popup

                // Select the #timeBlocksContainer div
                let divElement = document.querySelector('#timeBlocksContainer');

                // Select all child elements within the div
                let childElements = divElement.querySelectorAll('*');
                let time = "";
                childElements.forEach(function(childElement) {
                    if (compareBackgroundColorHex(childElement, "#A12929")) {
                        time = time + childElement.innerText + " ";
                    }
                });


                // seats
                divElement = document.querySelector('#seatsContainer');
                // Select all child elements within the div
                childElements = divElement.querySelectorAll('*');
                let seat = null;
                childElements.forEach(function(childElement) {
                    let blockElements = childElement.querySelectorAll('button');
                    blockElements.forEach(function(blockElement) {
                        if (compareBackgroundColorHex(blockElement, "#FFFFFF")) { // rgb(76, 175, 80) is the RGB equivalent of #4CAF50
                            seat = blockElement.innerText;
                        }
                    });
                    
                });

                // Select the dropdowns
                let tierSelect = document.querySelector('#tierSelect');
                let daySelect = document.querySelector('#daySelect');

                // Get the selected values
                let selectedTier = tierSelect.value;
                let selectedDay = daySelect.value;

                console.log('Selected Tier:', selectedTier);
                console.log('Selected Day:', selectedDay);

                // Get the input values
                let reserveUsername = reservationForm.elements['name'].value;
                let reserveEmail = reservationForm.elements['email'].value;

                if (getIsManager()){
                    if (reserveUsername == "") {
                        reserveUsername = "Walk-in";
                    }
                    if ( reserveEmail == "") {
                        reserveEmail = "Walk-in";
                    }
                }
                
                h4Element.insertAdjacentHTML('afterend', `<p>Username: ${reserveUsername}</p><p>Email: ${reserveEmail}</p><p>Selected Tier: ${selectedTier}</p><p>Selected Day: ${selectedDay}</p><p>Selected Time/s: ${time}</p><p>Selected Seat: ${seat}</p>`);
                togglePopup(confirmationPopup);
            } else {
                togglePopup(loginPopup);
            }
        });

        // Select the delete button
        let deleteButton = document.getElementById('deleteButtonRes');

        // Add an event listener for the delete button's click event
        deleteButton.addEventListener('click', function(event) {
            if (logged) {
                // Show the confirmation popup

                // Replace the HTML of the h4 element
                h4Element.innerHTML = 'Confirm Deletion';

                // Select the #timeBlocksContainer div
                let divElement = document.querySelector('#timeBlocksContainer');

                // Select all child elements within the div
                let childElements = divElement.querySelectorAll('*');
                let time = null;
                // Loop through the child elements and check their color
                childElements.forEach(function(childElement) {
                    let blockElements = childElement.querySelectorAll('button');
                    blockElements.forEach(function(blockElement) {
                        if (compareBackgroundColorHex(blockElement, "#4CAF50")) { // rgb(76, 175, 80) is the RGB equivalent of #4CAF50
                            time = blockElement.innerText;
                        }
                    });
                    
                });


                // seats
                divElement = document.querySelector('#seatsContainer');
                // Select all child elements within the div
                childElements = divElement.querySelectorAll('*');
                let seat = null;
                childElements.forEach(function(childElement) {
                    let blockElements = childElement.querySelectorAll('button');
                    blockElements.forEach(function(blockElement) {
                        if (compareBackgroundColorHex(blockElement, "#FFFFFF")) { // rgb(76, 175, 80) is the RGB equivalent of #4CAF50
                            seat = blockElement.innerText;
                        }
                    });
                    
                });

                // Select the dropdowns
                let tierSelect = document.querySelector('#tierSelect');
                let daySelect = document.querySelector('#daySelect');

                // Get the selected values
                let selectedTier = tierSelect.value;
                let selectedDay = daySelect.value;

                console.log('Selected Tier:', selectedTier);
                console.log('Selected Day:', selectedDay);

                //alert(time);

                const details = unavailableTimeSlots[time];
                const delUsername = details.name;
                const delEmail = details.email;
                
                h4Element.insertAdjacentHTML('afterend', `<p>Username: ${delUsername}</p><p>Email: ${delEmail}</p><p>Selected Tier: ${selectedTier}</p><p>Selected Day: ${selectedDay}</p><p>Selected Time: ${time}</p><p>Selected Seat: ${seat}</p>`);
                togglePopup(confirmationPopup);
            } else {
                // Show the login popup
                togglePopup(loginPopup);
            }
        });

        // Select the confirmation button
        let confirmationButton = document.getElementById('confirm-confirmation');
        // Add an event listener for the confirmation button's click event
        confirmationButton.addEventListener('click', function(event) {
            // Prevent the button's default action
            event.preventDefault();

            // Submit the form manually
            if (submitBool == true) {
                submitBool = false;
                reservationForm.submit();   
            } else {
                window.location.href = '/reserve?delete=true';
                // for delete popup function
            }
        });

        // Select the cancel button
        let cancelButton = document.getElementById('cancel-confirmation');

        // Add an event listener for the cancel button's click event
        cancelButton.addEventListener('click', function(event) {
            submitBool = false;
            // Prevent the button's default action
            event.preventDefault();

            
            togglePopup(confirmationPopup);

            // clears confirmation popup details
            // Hide the popup confirmation
            // Select the confirmationdiv
            let divElement = document.querySelector('#confirmationPopup');

            // Select all p elements within the div
            let pElements = divElement.querySelectorAll('p');

            // Loop through the p elements and remove each one
            pElements.forEach(function(pElement) {
                pElement.remove();
            });
        });

        // Select the close button
        let closeButton = document.querySelector('#confirmationPopup .close');
        // Add an event listener for the close button's click event
        closeButton.addEventListener('click', function(event) {
            submitBool = false;
            
            // Prevent the button's default action
            event.preventDefault();

            // Hide the popup confirmation
            togglePopup(confirmationPopup);

            // clears confirmation popup details
            // Hide the popup confirmation
            // Select the confirmationdiv
            let divElement = document.querySelector('#confirmationPopup');

            // Select all p elements within the div
            let pElements = divElement.querySelectorAll('p');

            // Loop through the p elements and remove each one
            pElements.forEach(function(pElement) {
                pElement.remove();
            });
        });
    } //Reservation page confirmation popup handler END

});


document.addEventListener('DOMContentLoaded', function() {
    var editBtn = document.getElementById('editProfileBtn');
    var userName = document.getElementById('userName');
    var userBio = document.getElementById('userBio');
    var profileImageContainer = document.getElementById('profileImageContainer');
    var coverImageContainer = document.getElementById('coverBannerContainer');
    var imageOverlay = document.getElementById('imageOverlay');
    var coverOverlay = document.getElementById('coverOverlay');
    var profileImageInput = document.getElementById('profileImageInput');
    var coverImageInput = document.getElementById('coverImageInput');
    var editIcon = document.getElementById('editIcon');
    var mainProfile = document.getElementById('main-profile');

    var editing = false;

    function toggleEditMode() {
        editing = !editing;
        userName.contentEditable = editing;
        userBio.contentEditable = editing;
    
        if (editing) {
            userName.classList.add('editable');
            userBio.classList.add('editable');
            editIcon.className = 'fa fa-check';
            imageOverlay.classList.add('cursor-pointer'); 
            coverOverlay.classList.add('cursor-pointer'); 
            focusAtEnd(userName);
        } else {
            userName.classList.remove('editable');
            userBio.classList.remove('editable');
            editIcon.className = 'fa fa-pencil';
            imageOverlay.classList.remove('cursor-pointer'); 
            coverOverlay.classList.remove('cursor-pointer'); 
        }
    
        profileImageContainer.classList.toggle('with-overlay', editing);
        coverImageContainer.classList.toggle('with-overlay', editing);
    }

    var userNameMaxLength = 19; // Set your desired max length
    var userBioMaxLength = 160; // Set your desired max length
    

    userName.addEventListener('keypress', function(e) {
        if (userName.textContent.length >= userNameMaxLength) {
            e.preventDefault();
        }
    });

    userBio.addEventListener('keypress', function(e) {
        if (userBio.textContent.length >= userBioMaxLength) {
            e.preventDefault();
        }
    });

    userName.addEventListener('input', function() {
        this.textContent = this.textContent.replace(/\s/g, '');
    });
    
    userName.addEventListener('keydown', function(e) {
        if (e.key === ' ') {
            e.preventDefault();
        }
    });

    editBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleEditMode();
    });

    function handleProfileImageUpload(e) {
        e.stopPropagation(); // Prevent triggering edit mode toggle
        if (editing) {
            profileImageInput.click();
        }
    }

    function handleCoverImageUpload(e) {
        e.stopPropagation(); // Prevent triggering edit mode toggle
        if (editing) {
            coverImageInput.click();
        }
    }

    imageOverlay.addEventListener('click', handleProfileImageUpload);
    coverOverlay.addEventListener('click', handleCoverImageUpload);

    profileImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profileImage').src = e.target.result;
                document.getElementById('navbarProfileImage').src = e.target.result;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    coverImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                coverImageContainer.style.backgroundImage = 'url(' + e.target.result + ')';
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Define the focusAtEnd function if it's not already defined
    function focusAtEnd(element) {
        var range = document.createRange();
        var sel = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        element.focus();
    }
});

function saveProfileChanges() {
    // Example logic to send updated profile information and images to the server
    // You need to implement AJAX request here according to your server API

    var userName = document.getElementById('userName').innerText;
    var userBio = document.getElementById('userBio').innerText;

    console.log('Saving profile changes:', userName, userBio);
    // Here, add your AJAX call to send the userName, userBio, and image files to the server

    // Reset editing state
    editing = false;
    // Update UI to reflect the non-editing state
}

/* === Manage === */

// Placeholder data to simulate backend response
const reservationDetails = {
    userName: "John Doe",
    userEmail: "johndoe@example.com",
    tierSelected: "tier2",
    selectedDate: "2024-03-15", // Example date
    selectedSeat: 5, // Example seat number
    selectedTimeBlocks: ["09:00", "09:30"] // Example selected time blocks
};

document.addEventListener('DOMContentLoaded', () => {
    // To execute this code only when user is not on the /manage page
    if (!(window.location.pathname === '/manage')) {
        loadReservationDetails();
        lockSelections();
    }
    
});

function loadReservationDetails() {
    // Load user details
    document.getElementById('userName').value = reservationDetails.userName;
    document.getElementById('userEmail').value = reservationDetails.userEmail;

    // Select and lock the tier
    const tierSelect = document.getElementById('tierSelect');
    tierSelect.value = reservationDetails.tierSelected;
    tierSelect.disabled = true; // Lock the tier selection

    // Populate and lock date selection (assuming you have a function to populate dates)
    populateDates(); // This function should populate your date select options
    const dateSelect = document.getElementById('daySelect');
    dateSelect.value = reservationDetails.selectedDate;
    dateSelect.disabled = true; // Optionally lock the date selection

    // Mark the selected seat as selected
    // This should ideally run after your seat generation code
    markSelectedSeat(reservationDetails.selectedSeat);

    // Populate and mark selected time blocks
    populateTimeBlocks(reservationDetails.selectedTimeBlocks);
}

function populateDates() {
    // Populate your date options here, similar to how you populate time blocks
    const daySelect = document.getElementById('daySelect');
    // Example: Populate with dates. This should be dynamic based on your requirements.
    const option = document.createElement('option');
    option.value = reservationDetails.selectedDate; // Use the placeholder date
    option.textContent = reservationDetails.selectedDate; // Same as above
    daySelect.appendChild(option);
}

function markSelectedSeat(seatNumber) {
    // Assuming seats are already generated and have IDs or data attributes to identify them
    const selectedSeat = document.querySelector(`.seat[data-seat-number="${seatNumber}"]`);
    if (selectedSeat) {
        selectedSeat.classList.add('selected');
        selectedSeat.disabled = true; // Disable the button to prevent changing the selection
    }
}

//not used
function populateTimeBlocks(selectedTimes = []) {
    const isManagePage = document.getElementById('managePage') !== null;
    const timeBlocksContainer = document.getElementById('timeBlocksContainer');
    timeBlocksContainer.innerHTML = ''; // Clear previous time blocks
    timeBlocksContainer.style.display = 'block'; // Ensure the container is visible

    // Generate time blocks
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeBlock = document.createElement('button');
            timeBlock.classList.add('time-block', 'available'); // 'available' for styling
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeBlock.textContent = timeString;
            timeBlock.value = timeString;

            if (isManagePage) {
                // For manage.html, disable the time blocks and mark selected ones
                timeBlock.disabled = true; // Disable the buttons to prevent changing the selection
                if (selectedTimes.includes(timeString)) {
                    timeBlock.classList.add('selected');
                }
            } else {
                // For reserve.html, keep the time blocks interactive
                timeBlock.addEventListener('click', function() {
                    // Toggle selection logic here
                });
            }

            timeBlocksContainer.appendChild(timeBlock);
        }
    }
}


// Call this function after your seat and time block generation logic to lock the selections
function lockSelections() {
    // Additional logic to lock selections, if not already handled in the above functions
}


function fetchReservationDetails() {
    fetch('path/to/your/api/endpoint')
        .then(response => response.json())
        .then(data => {
            document.getElementById('userName').value = data.userName;
            document.getElementById('userEmail').value = data.userEmail;
            document.getElementById('tierText').textContent = data.tierSelected;
            // Process additional data as needed
        })
        .catch(error => console.error('Error loading reservation details:', error));
}

/* === Manage END ===*/


// === Forms ===

// make the funciton to be async with async keyword (required by await keyword)
// at the form [ onsubmit="event.preventDefault(); checkLogin().then(valid => { if (valid) this.submit(); })" ]
// ^^ supports for asynchronous operations --- checkLogin() is assumed to be a function that returns a Promise. This Promise represents the ongoing AJAX request to check the login credentials.
// ^^ The .then(valid => { if (valid) this.submit(); }) part is a Promise chain. When the Promise returned by checkLogin() resolves, the function passed to .then() is called with the resolved value. 
// ^^ If the resolved value (valid) is truthy, the form is manually submitted with this.submit().
async function checkLogin() {
    let form = $('form[name="login"]'); // Selects the form with the name 'login'
    let username = form.find('input[name="username"]').val(); // Gets the value of the input with the name 'username'
    let password = form.find('input[name="password"]').val(); // Gets the value of the input with the name 'password'
    
    let valid = false;
    let user = null;

    try {  
        // uses await to wait for the response from the server instead of forcing synchronousity
        let response = await $.ajax({   // returns a JSON with user element object
            url: '/check-login',
            type: 'POST',
            data: {
                username: username,
                password: password
            }
        });

        valid = response.valid;
    } catch (error) {
        console.error('Error:', error);
    }

    window.alert(valid ? "Login successful" : 'Login failed');

    return valid;
}