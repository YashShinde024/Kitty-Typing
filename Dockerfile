FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy everything from public into nginx web root
COPY public/ .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
