
#!/bin/sh

# Start nginx in the background
nginx -g "daemon off;" &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
