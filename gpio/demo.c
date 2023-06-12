#include<linux/init.h>
#include<linux/kernel.h>
#include<linux/module.h>
#include<linux/fs.h>
#include<linux/uaccess.h>

#define MAJOR_NUM 60
#define MODULE_NAME "demo"

static int iCount=0;
static char userChar[50]; 

static ssize_t drv_read(struct file *filp,char *buf,size_t count, loff_t *ppos){
    printk("%s: Enter Read function", "Read");
    printk("device read\n");
    copy_from_user(userChar, buf, count);
    printk("%s", userChar);

    char gpio[10]={0};
    strncpy(gpio,userChar,3);
    printk("gpio: %s, length: %d\n", gpio, strlen(gpio));

    loff_t pos=0;
    mm_segment_t old_fs;
    old_fs=get_fs();
    set_fs(get_ds());

    char gpio_path[50];
    snprintf(gpio_path, sizeof(gpio_path), "/sys/class/gpio/gpio%s/value", gpio);
    printk("%s", gpio_path);
    struct file *io=filp_open(gpio_path, O_RDWR, 0);
    if (IS_ERR(io)) {
        printk("Failed to open GPIO file\n");
        set_fs(old_fs);
        return;
    }

    printk("file is open!\n");
    char value[10]={0};
    value[0]='a';
    ssize_t res = vfs_read(io, value, strlen(value), &pos);
    printk("value: %s, length: %d\n", value, strlen(value));
    printk("read state:%zd, %s", res, value); //read state
    
    filp_close(io, NULL);

    set_fs(old_fs);
    
    copy_to_user(buf, value, 1);

    return count;
}

static ssize_t drv_write(struct file *filp,const char *buf,size_t count,loff_t *ppos){

    printk("%s: Enter Write function", "Write");
    printk("device write\n");
    printk("%d\n",iCount);
    copy_from_user(userChar,buf,count);
    userChar[count - 1] = 0;
    printk("userChar: %s\n",userChar);
    // printk("userChar: %d\n",(int)sizeof(userChar));
    char gpio[10]={0};
    strncpy(gpio,userChar,3);
    printk("gpio: %s, length: %d\n", gpio, strlen(gpio));

    //
    loff_t pos=0;
    mm_segment_t old_fs;
    old_fs=get_fs();

    //transfer to userspace
    set_fs(get_ds());

    //export
    struct file *export_file = filp_open("/sys/class/gpio/export", O_WRONLY, 0);
    if (IS_ERR(export_file)) {
        printk("Failed to open GPIO export file\n");
        set_fs(old_fs);
        return;
    }

    //write gpio
    vfs_write(export_file, gpio, strlen(gpio), &pos);
    filp_close(export_file, NULL);

    //direction
    char gpio_direction_path[50];
    snprintf(gpio_direction_path, sizeof(gpio_direction_path), "/sys/class/gpio/gpio%s/direction", gpio);
    struct file *direction_file=filp_open(gpio_direction_path, O_WRONLY, 0);
    if (IS_ERR(direction_file)) {
        printk("Failed to open GPIO direction file\n");
        set_fs(old_fs);
        return;
    }

    char direction[] = "out";
    vfs_write(direction_file, direction, strlen(direction), &pos);
    filp_close(direction_file, NULL);

    //write value to gpio
    char gpio_path[50];
    snprintf(gpio_path, sizeof(gpio_path), "/sys/class/gpio/gpio%s/value", gpio);
    struct file *io=filp_open(gpio_path, O_RDWR, 0);
    if (IS_ERR(io)) {
        printk("Failed to open GPIO file\n");
        set_fs(old_fs);
        return;
    }

    printk("file is open!\n");
    char value[3]={0};
    value[0] = userChar[3];
    value[1]='\0';
    printk("value:%s, length:%d",value, strlen(value));

    vfs_write(io, value, strlen(value), &pos);
    char temp[2]={0};
    temp[0]='a';
    pos=0;
    ssize_t res = vfs_read(io, temp, strlen(temp), &pos);
    printk("read state:%zd, value:%s", res, temp);

    filp_close(io, NULL);

    //transfer to userspace
    set_fs(old_fs);

    iCount++;
    return count;
}

long drv_ioctl(struct file *filp,unsigned int cmd,unsigned long arg){
    printk("%s: Enter I/O Control function", "I/O Control");
    printk("device ioctl\n");
    return 0;
}

static int drv_open(struct inode *inode,struct file *filp)
{
    printk("%s: Enter Open function", "Open");
    printk("device open\n");
    return 0;
}

static int drv_release(struct inode *inode,struct file *filp)
{
    printk("%s: Enter Release function", "Release");
    printk("device close\n");
    return 0;
}

struct file_operations drv_fops=
{
    read: drv_read,
    write: drv_write,
    unlocked_ioctl: drv_ioctl,
    open: drv_open,
    release: drv_release,
};

static int demo_init(void){
    if(register_chrdev(MAJOR_NUM,"demo",&drv_fops)<0){
        printk("<1>%s: can't get major %d\n",MODULE_NAME,MAJOR_NUM);
        return(-EBUSY);
    }
    printk("<1>%s: started\n",MODULE_NAME);
    return 0;
}

static void demo_exit(void){
    unregister_chrdev(MAJOR_NUM,"demo");
    printk("<1>%s:removed\n",MODULE_NAME);
}

module_init(demo_init);
module_exit(demo_exit);