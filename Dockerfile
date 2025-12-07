# Use lightweight nginx image
FROM nginx:alpine

# Copy static files into nginx html folder
# This will serve /public and /assets as your site
COPY public /usr/share/nginx/html
COPY assets /usr/share/nginx/html/assets

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
