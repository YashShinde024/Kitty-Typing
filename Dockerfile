FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY public/ .
COPY assets/ ./assets
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
