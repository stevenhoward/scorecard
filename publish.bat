call npm run build

scp -r -i %SCP_ID% build/* %SCP_HOST%:scorecard
