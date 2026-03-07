FROM ghcr.io/muchobien/pocketbase:latest

# Copy migration files into the image so they run automatically on first boot
COPY pb_migrations/ /pb/pb_migrations/

# Copy the entrypoint script
COPY pb_entrypoint.sh /pb_entrypoint.sh
RUN chmod +x /pb_entrypoint.sh

EXPOSE 8090

ENTRYPOINT ["/pb_entrypoint.sh"]
