#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <iostream>
#include <map>
#include <string>
#include <cstring>
using namespace std;

void setGPIO(unsigned int gpio, string status)
{

    int io;
    io = open("/dev/demo", O_RDWR);
    if (io < 0)
    {
        perror("gpio error");
        return;
    }

    char buf[10] = {0};
    ssize_t temp = 1;
    if (status == "null")
    {
        if (status == "on")
        {
            strcpy(buf, (to_string(gpio)).c_str());
        }
        else
        {
            strcpy(buf, (to_string(gpio)).c_str());
        }
        cout << buf << endl;
        unlockpt(io);
        read(io, buf, 3);
        // printf("LED State:%d\n", static_cast<int>(temp)-'0');
        cout << "LED State:" << buf[0] << endl;
    }
    else
    {

        if (status == "on")
        {
            strcpy(buf, (to_string(gpio) + "1").c_str());
        }
        else
        {
            strcpy(buf, (to_string(gpio) + "0").c_str());
        }

        unlockpt(io);
        write(io, buf, 5);
        cout << buf << endl;
    }

    close(io);
    return;
}

int main(int argc, char *argv[])
{

    unsigned int LED;

    if (argv[1] == NULL || argv[2] == NULL)
    {
        cout << "error" << endl;
        return 1;
    }

    if (strcmp(argv[1], "LED1") == 0)
    {
        LED = 396;
    }
    else if (strcmp(argv[1], "LED2") == 0)
    {
        LED = 392;
    }
    else if (strcmp(argv[1], "LED3") == 0)
    {
        LED = 481;
    }
    else if (strcmp(argv[1], "LED4") == 0)
    {
        LED = 398;
    }
    else
    {
        printf("%s", argv[1]);
        printf("\nerror input\n");
        return 1;
    }

    if (argc < 3)
    {
        // state
        setGPIO(LED, "null");
    }
    else
    {
        // gpio setup
        setGPIO(LED, argv[2]);
    }
    return 0;
}