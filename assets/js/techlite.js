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
	});

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

//would be very convenient if we have the copy of db here
//generate code to obtain the data from the database


/* Reserve */
function showSeats(tier) {
    const seatsContainer = document.getElementById('seatsContainer');
    seatsContainer.innerHTML = ''; // Clear previous seats
    let selectedSeat = null; // Keep track of the selected seat

    // Create a container for each column to hold the seats
    const columns = [];
    for (let i = 0; i < 3; i++) {
        const column = document.createElement('div');
        column.classList.add('seat-column');
        seatsContainer.appendChild(column);
        columns.push(column);
    }

    // Populate each column with 5 seats
    for (let i = 1; i <= 15; i++) {
        const seat = document.createElement('button');
        seat.classList.add('seat');
        
        // Determine the column index (0, 1, or 2) based on the seat number
        const columnIndex = Math.floor((i - 1) / 5);

        if (Math.random() < 0.3) { // 30% chance a seat is unavailable
            seat.classList.add('unavailable');
        } else {
            // Add click event to available seats
            seat.addEventListener('click', function() {
                // Highlight the selected seat and unhighlight the previous one
                if (selectedSeat) {
                    selectedSeat.classList.remove('selected');
                }
                this.classList.add('selected');
                selectedSeat = this;

                // Display the reservation form
                document.getElementById('reservationForm').style.display = 'block';
                //include here logic to get the value from mongoDB
                //use seat.textContent to get the seat number
                let seatnumber = Number(this.textContent.slice(5));
                let tiernumber = Number(document.getElementById("tierSelect").value);

                $.post(
                    /* Link sent to the server */
                    'reserve',
                    /* Input sent to the server */
                    { seat_num: seatnumber, tier_num: tiernumber },
                    /* Call-back function that processes the server response */
                    function(data, status){
                      if(status === 'success'){
                        //using tier and seatnumber, get the array of available timeslots from the database
                        //then populate the select element with the available timeslots
                        //clear the select element first
                        var selection = document.getElementById("tierSelect");

                        // Remove all options
                        while (selection.options.length > 0) {
                            select.remove(0); // Remove the first option (index 0) repeatedly until no options are left
                        }

                        //let textContent = $("<div></div>").text($('#textinput').val()+' : '+data.sound);
                        $('#contentbody').append(textContent);
                      }//if
                    });//fn+post

            
                document.getElementById('name').value = ''; // Reset form values

                //document.getElementById('timeFrom').value = '';
                //document.getElementById('timeTo').value = '';
            });
        }

        seat.textContent = `Seat ${i}`;
        columns[columnIndex].appendChild(seat);
    }
}



function submitReservation() {
    // Example validation: check if name is entered
    const name = document.getElementById('name').value;
    if (name.trim() === '') {
        alert('Please enter your name.');
        return;
    }

    // Simulate a successful reservation
    document.getElementById('confirmationPopup').style.display = 'block';
}

function closePopup() {
    document.getElementById('confirmationPopup').style.display = 'none';
}


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



  