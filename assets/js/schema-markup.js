// Local Business Schema Markup (JSON-LD)
// This helps Google understand your dental clinic details
document.addEventListener('DOMContentLoaded', function(){
  const schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  schemaScript.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://anupamdentalclinic.com/#organization",
    "name": "Anupam Dental Clinic",
    "image": "https://anupamdentalclinic.com/assets/images/logo.png",
    "description": "Professional dental clinic offering root canal treatment, cosmetic dentistry, preventive care, and oral surgery in your city.",
    "url": "https://anupamdentalclinic.com",
    "telephone": "+91 98765 43210",
    "email": "info@anupamdentalclinic.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Dental Street",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "000000",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "17:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "10:00",
        "closes": "14:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/anupamdentalclinic",
      "https://www.instagram.com/anupamdentalclinic",
      "https://www.youtube.com/anupamdentalclinic"
    ],
    "priceRange": "₹1500 - ₹10000",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "9.750784",
      "longitude": "76.389496"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "245",
      "bestRating": "5",
      "worstRating": "1"
    },
    "medicalSpecialty": [
      "Dentistry",
      "Endodontics",
      "Prosthodontics",
      "Periodontics"
    ]
  });
  
  document.head.appendChild(schemaScript);
});

// Organization & WebSite Schema
document.addEventListener('DOMContentLoaded', function(){
  const orgSchema = document.createElement('script');
  orgSchema.type = 'application/ld+json';
  orgSchema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Anupam Dental Clinic",
    "url": "https://anupamdentalclinic.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://anupamdentalclinic.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "+91 98765 43210",
      "email": "info@anupamdentalclinic.com"
    }
  });
  
  document.head.appendChild(orgSchema);
});
