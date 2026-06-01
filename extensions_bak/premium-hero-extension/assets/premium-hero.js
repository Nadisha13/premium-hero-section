document.addEventListener("DOMContentLoaded", function() {
  var wrappers = document.querySelectorAll(".hero-template-wrapper");
  wrappers.forEach(function(wrapper) {
    var templateId = wrapper.getAttribute("data-template-id");
    var blockId = wrapper.getAttribute("data-block-id");
    var shop = wrapper.getAttribute("data-shop");
    if (!templateId || !shop || !blockId) return;

    fetch("/apps/premium-hero-proxy?template_id=" + encodeURIComponent(templateId) + "&shop=" + encodeURIComponent(shop))
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.success) {
          // Check block plan-tier access permission
          if (data.unlocked === false) {
            if (window.Shopify && window.Shopify.designMode) {
              wrapper.innerHTML = '<div style="padding: 4rem 2rem; text-align: center; background: #0f172a; color: #f59e0b; border: 2px dashed #d97706; border-radius: 12px; font-family: sans-serif; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">' +
                '<h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">🔒 Template Locked</h3>' +
                '<p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: #94a3b8;">The <strong>' + templateId + '</strong> template is locked under your current subscription.</p>' +
                '<p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #38bdf8; font-weight: bold;">Please upgrade your plan in the Premium Hero Section app to activate it.</p>' +
                '</div>';
              wrapper.style.minHeight = "auto";
              wrapper.style.backgroundImage = "none";
              wrapper.style.backgroundColor = "#070a13";
              wrapper.style.padding = "3rem 1rem";
            } else {
              wrapper.style.display = "none";
            }
            return;
          }

          var cust = data.customization;
          if (cust) {
            var headingEl = document.getElementById("premium-hero-heading-" + blockId);
            var descEl = document.getElementById("premium-hero-description-" + blockId);
            var btnEl = document.getElementById("premium-hero-btn-" + blockId);

            if (cust.heading && headingEl) {
              headingEl.innerText = cust.heading;
            }
            if (cust.description && descEl) {
              descEl.innerText = cust.description;
            }
            if (cust.buttonText && btnEl) {
              btnEl.innerText = cust.buttonText;
            }
            if (cust.primaryColor) {
              if (headingEl) headingEl.style.color = cust.primaryColor;
              if (btnEl) btnEl.style.backgroundColor = cust.primaryColor;
            }
            if (cust.secondaryColor) {
              wrapper.style.backgroundColor = cust.secondaryColor;
              wrapper.style.backgroundImage = "linear-gradient(135deg, " + cust.secondaryColor + " 0%, rgba(10,10,10,0.15) 100%)";
            }
            if (cust.image) {
              var bgImg = document.getElementById("premium-hero-bg-" + blockId);
              if (bgImg) {
                bgImg.src = cust.image;
              } else {
                var img = document.createElement("img");
                img.id = "premium-hero-bg-" + blockId;
                img.className = "hero-media-bg";
                img.src = cust.image;
                img.alt = "Hero Background";
                img.style.opacity = "0.4";
                img.width = 1500;
                img.height = 800;
                wrapper.insertBefore(img, wrapper.firstChild);
              }
            }
          }
        }
      })
      .catch(function(err) {
        console.error("Error fetching hero settings:", err);
      });
  });
});
