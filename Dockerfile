FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# copy everything the browser needs
COPY public/ .
COPY assets/ ./assets
COPY src/ ./src

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
