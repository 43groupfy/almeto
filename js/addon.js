// Javascript Mobile Navigation Bar 
 document.addEventListener('DOMContentLoaded', function() {
            const menuToggle = document.getElementById('menuToggle');
            const navLinks = document.getElementById('navLinks');
            const navOverlay = document.getElementById('navOverlay');
            
            function toggleMenu() {
                menuToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
                navOverlay.classList.toggle('active');
                document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            }
            
            menuToggle.addEventListener('click', toggleMenu);
            navOverlay.addEventListener('click', toggleMenu);
            
            // Close menu when clicking on a link
            const navItems = navLinks.querySelectorAll('a');
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        toggleMenu();
                    }
                });
            });
            
            // Close menu on window resize if it becomes desktop view
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768) {
                    menuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    navOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
   