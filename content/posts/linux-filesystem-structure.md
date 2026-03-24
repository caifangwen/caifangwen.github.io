---
title: "Linux 系统文件结构详解"
date: 2026-03-23T02:59:13+08:00
draft: false
tags: ["Linux", "文件系统", "运维", "系统管理"]
categories: ["Linux"]
description: "深入介绍 Linux 系统的文件目录结构，包括每个核心目录的作用、设计哲学及实用技巧，帮助你真正理解 Linux 文件系统的组织方式。"
author: "Claude"
slug: "linux-filesystem-structure"
toc: true
---

## 前言

Linux 系统与 Windows 截然不同——它没有 C 盘、D 盘之分，而是以一棵倒置的树状结构来组织所有文件。无论你连接了多少块硬盘、U 盘还是网络存储，它们最终都挂载在同一棵目录树之下。理解这棵树，是掌握 Linux 的第一步。

Linux 文件系统的设计遵循 **FHS（Filesystem Hierarchy Standard，文件系统层次结构标准）**，该标准由 Linux 基金会维护，规定了各目录的用途与内容，使不同发行版之间保持较高的一致性。

---

## 整体结构概览

```
/
├── bin/        # 基本用户命令
├── boot/       # 启动引导文件
├── dev/        # 设备文件
├── etc/        # 系统配置文件
├── home/       # 用户家目录
├── lib/        # 核心共享库
├── lib64/      # 64位共享库
├── media/      # 可移动介质挂载点
├── mnt/        # 临时挂载点
├── opt/        # 可选第三方软件
├── proc/       # 进程与内核虚拟文件系统
├── root/       # root用户的家目录
├── run/        # 运行时数据
├── sbin/       # 系统管理命令
├── srv/        # 服务数据
├── sys/        # 内核与设备虚拟文件系统
├── tmp/        # 临时文件
├── usr/        # 用户程序与数据
└── var/        # 可变数据（日志、缓存等）
```

所有路径都从根目录 `/` 出发。这个单一的根是 Linux 哲学的体现：**一切皆文件**。

---

## 根目录 `/`

根目录是整个文件系统的起点。它不属于任何分区，而是所有挂载点的逻辑汇聚处。根目录本身应当尽量精简，只保留系统启动和恢复所必需的内容。

```bash
ls -la /
```

> **注意**：根目录下的内容直接影响系统能否正常启动。不要随意在根目录下创建文件或目录。

---

## `/bin` — 基本用户命令

**bin** 是 *binary*（二进制）的缩写。`/bin` 存放所有用户（包括普通用户和 root）在系统正常运行或单用户模式下都可能用到的**基本命令**。

典型内容：

| 命令 | 说明 |
|------|------|
| `ls` | 列出目录内容 |
| `cp` | 复制文件 |
| `mv` | 移动/重命名文件 |
| `rm` | 删除文件 |
| `cat` | 查看文件内容 |
| `echo` | 打印字符串 |
| `bash` / `sh` | Shell 解释器 |
| `grep` | 文本搜索 |
| `chmod` | 修改权限 |

> **现代变化**：在许多现代发行版（如 Ubuntu 20.04+、Fedora、Arch Linux）中，`/bin` 已经是指向 `/usr/bin` 的**符号链接**，两者合并，这是 `usrmerge` 项目推动的结果。

---

## `/boot` — 启动引导文件

`/boot` 包含操作系统启动所需的所有文件，是系统加电后最先被访问的目录之一。

典型内容：

- **`vmlinuz`**：压缩的 Linux 内核镜像（`vmlinuz-6.x.x-generic`）
- **`initrd.img`** / **`initramfs`**：初始内存盘，用于在根文件系统挂载前提供临时环境
- **`grub/`**：GRUB 引导加载器的配置文件，包括 `grub.cfg`
- **`System.map`**：内核符号表，供调试使用

```bash
ls /boot
# vmlinuz-6.8.0-49-generic
# initrd.img-6.8.0-49-generic
# grub/
# config-6.8.0-49-generic
```

> ⚠️ `/boot` 通常单独分区（建议 512MB ~ 1GB），使用 ext4 或 FAT32 格式。在 UEFI 系统中，还存在独立的 **EFI 系统分区（ESP）**，通常挂载为 `/boot/efi`。

---

## `/dev` — 设备文件

Linux 的"一切皆文件"哲学在 `/dev` 得到最直观的体现。所有硬件设备都以文件形式呈现：

### 常见设备文件

| 文件 | 含义 |
|------|------|
| `/dev/sda` | 第一块 SATA/SCSI 硬盘 |
| `/dev/sda1` | 第一块硬盘的第一个分区 |
| `/dev/nvme0n1` | 第一块 NVMe 固态硬盘 |
| `/dev/tty` | 当前终端 |
| `/dev/tty1` ~ `/dev/tty6` | 虚拟控制台 |
| `/dev/pts/0` | 伪终端（SSH 会话等） |
| `/dev/null` | 黑洞设备，丢弃所有写入 |
| `/dev/zero` | 无限输出零字节 |
| `/dev/random` | 随机数生成器（阻塞） |
| `/dev/urandom` | 随机数生成器（非阻塞） |
| `/dev/mem` | 物理内存映射 |

### 设备文件类型

- **块设备（b）**：以块为单位读写，如硬盘、U 盘
- **字符设备（c）**：以字符为单位读写，如终端、串口

```bash
ls -l /dev/sda /dev/tty
# brw-rw---- 1 root disk 8, 0 /dev/sda    ← b 表示块设备
# crw-rw-rw- 1 root tty  5, 0 /dev/tty   ← c 表示字符设备
```

`/dev` 由 **udev** 守护进程动态管理，设备插入时自动创建对应文件，拔出时自动删除。

---

## `/etc` — 系统配置文件

`/etc` 是 Linux 系统中最重要的目录之一，存放**全局配置文件**。名称来源众说纷纭，最广为接受的是 *"Editable Text Configuration"* 或历史上的 *"et cetera"*（等等）。

### 重要配置文件

| 文件/目录 | 作用 |
|-----------|------|
| `/etc/passwd` | 用户账户信息 |
| `/etc/shadow` | 用户密码哈希（加密存储） |
| `/etc/group` | 用户组信息 |
| `/etc/hosts` | 静态主机名解析 |
| `/etc/hostname` | 本机主机名 |
| `/etc/fstab` | 文件系统挂载配置 |
| `/etc/resolv.conf` | DNS 服务器配置 |
| `/etc/network/interfaces` | 网络接口配置（Debian/Ubuntu） |
| `/etc/sysctl.conf` | 内核参数配置 |
| `/etc/crontab` | 系统级定时任务 |
| `/etc/ssh/sshd_config` | SSH 服务配置 |
| `/etc/apt/` | APT 包管理器配置（Debian/Ubuntu） |
| `/etc/yum.repos.d/` | YUM/DNF 仓库配置（RHEL/CentOS） |
| `/etc/systemd/` | systemd 配置 |
| `/etc/init.d/` | SysV init 启动脚本 |
| `/etc/profile` | 全局 Shell 环境变量 |
| `/etc/bashrc` | 全局 Bash 配置 |
| `/etc/os-release` | 发行版信息 |

```bash
cat /etc/os-release
# NAME="Ubuntu"
# VERSION="24.04 LTS (Noble Numbat)"
# ...
```

> 💡 修改 `/etc` 下的文件通常需要 root 权限。建议修改前先备份原文件，例如 `cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak`。

---

## `/home` — 用户家目录

每个普通用户在 `/home` 下都有一个专属目录，用于存放个人文件、配置和数据。

```
/home/
├── alice/
│   ├── .bashrc
│   ├── .ssh/
│   ├── Documents/
│   └── Downloads/
└── bob/
    ├── .bashrc
    └── Projects/
```

用户登录后，Shell 的工作目录默认为其家目录，可用 `~` 表示：

```bash
cd ~          # 回到家目录
echo $HOME    # 输出 /home/alice
```

### 隐藏文件与配置

家目录中以 `.` 开头的文件是**隐藏文件**，通常是各类程序的用户级配置：

- `~/.bashrc`：Bash 个人配置
- `~/.profile`：登录 Shell 环境变量
- `~/.ssh/`：SSH 密钥与配置
- `~/.gitconfig`：Git 个人配置
- `~/.config/`：XDG 规范的配置目录
- `~/.local/`：用户级程序数据和可执行文件

---

## `/lib` 与 `/lib64` — 共享库

`/lib` 存放系统启动和 `/bin`、`/sbin` 中程序运行所必需的**共享库文件**（类似 Windows 的 `.dll` 文件）。

- `/lib`：32 位共享库
- `/lib64`：64 位共享库

关键内容：

- **`/lib/modules/`**：内核模块（驱动程序）
- **`/lib/firmware/`**：硬件固件文件
- **`libc.so.6`**：C 标准库
- **`libm.so`**：数学库

```bash
ldd /bin/ls     # 查看 ls 命令依赖的共享库
# linux-vdso.so.1 => (0x...)
# libselinux.so.1 => /lib/x86_64-linux-gnu/libselinux.so.1
# libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6
```

> 同样地，在现代发行版中，`/lib` 通常是指向 `/usr/lib` 的符号链接。

---

## `/media` 与 `/mnt` — 挂载点

### `/media`

用于**自动挂载**可移动介质，如 U 盘、光盘、移动硬盘。当你插入 U 盘时，系统会自动在此创建挂载点：

```
/media/alice/MyUSB/
/media/cdrom/
```

### `/mnt`

用于**手动临时挂载**文件系统，管理员常用于维护操作：

```bash
mount /dev/sdb1 /mnt
ls /mnt
umount /mnt
```

---

## `/opt` — 可选第三方软件

`/opt` 用于安装**独立的第三方商业软件**或大型应用，这些软件不遵循标准包管理器的文件分散规则，而是将所有文件集中在一个子目录下：

```
/opt/
├── google/
│   └── chrome/
├── jetbrains/
│   └── idea/
└── zoom/
```

这种设计使得卸载软件时只需删除对应子目录，不会污染系统目录。

---

## `/proc` — 进程与内核虚拟文件系统

`/proc` 是一个**虚拟文件系统**，不占用实际磁盘空间，而是由内核在内存中动态生成。它提供了一个窗口，让用户空间程序读取和修改内核数据。

### 进程信息

每个运行中的进程在 `/proc` 下都有一个以 PID 命名的目录：

```
/proc/1234/
├── cmdline     # 启动命令行
├── status      # 进程状态
├── maps        # 内存映射
├── fd/         # 打开的文件描述符
├── net/        # 网络状态
└── environ     # 环境变量
```

```bash
cat /proc/1/cmdline    # 查看 PID 1（systemd/init）的命令行
cat /proc/self/status  # 查看当前进程状态
```

### 系统信息

| 文件 | 内容 |
|------|------|
| `/proc/cpuinfo` | CPU 详细信息 |
| `/proc/meminfo` | 内存使用情况 |
| `/proc/uptime` | 系统运行时间 |
| `/proc/version` | 内核版本 |
| `/proc/mounts` | 当前挂载的文件系统 |
| `/proc/net/dev` | 网络接口统计 |
| `/proc/sys/` | 内核参数（可通过 sysctl 修改） |
| `/proc/interrupts` | 中断统计 |
| `/proc/loadavg` | 系统负载 |

```bash
grep MemTotal /proc/meminfo   # 查看总内存
cat /proc/loadavg             # 查看系统负载
```

---

## `/root` — root 用户家目录

root 用户的家目录是 `/root`，而不是 `/home/root`。这样设计是为了确保即使 `/home` 分区损坏或未挂载，root 用户仍然能够登录并进行系统修复。

```bash
ls -la /root
# .bashrc  .profile  .ssh/  ...
```

---

## `/run` — 运行时数据

`/run` 是一个 **tmpfs**（内存文件系统），存放系统启动后各进程运行时产生的数据，重启后清空：

- PID 文件：`/run/sshd.pid`、`/run/nginx.pid`
- Socket 文件：`/run/docker.sock`
- 锁文件
- systemd 运行时数据：`/run/systemd/`

```bash
ls /run
# acpid.pid  sshd.pid  docker.sock  systemd/  ...
```

---

## `/sbin` — 系统管理命令

`/sbin` 存放**系统管理员使用的系统管理命令**，普通用户通常不需要（也没权限）使用这些命令：

| 命令 | 作用 |
|------|------|
| `fdisk` | 磁盘分区工具 |
| `mkfs` | 格式化文件系统 |
| `fsck` | 文件系统检查修复 |
| `ifconfig` / `ip` | 网络接口配置 |
| `iptables` | 防火墙规则管理 |
| `reboot` / `shutdown` | 重启/关机 |
| `mount` / `umount` | 挂载/卸载文件系统 |
| `swapon` / `swapoff` | 管理交换空间 |

> 同样，`/sbin` 在现代发行版中通常是指向 `/usr/sbin` 的符号链接。

---

## `/srv` — 服务数据

`/srv` 用于存放**系统对外提供服务的数据**，如 Web 服务器的网站文件、FTP 服务器的共享文件：

```
/srv/
├── http/       # Web 服务数据（部分发行版）
├── ftp/        # FTP 共享数据
└── git/        # Git 仓库
```

> 实际使用中，许多发行版并不统一遵循此约定，Web 数据可能存放在 `/var/www/` 或 `/opt/` 下。

---

## `/sys` — 内核与设备信息虚拟文件系统

`/sys` 是 **sysfs** 虚拟文件系统，与 `/proc` 类似但更结构化，专注于**内核对象、设备和驱动程序**的信息展示与控制：

```
/sys/
├── block/          # 块设备
├── bus/            # 总线（PCI、USB等）
├── class/          # 设备类（网卡、声卡等）
├── devices/        # 设备树
├── firmware/       # 固件接口（ACPI、EFI等）
├── fs/             # 文件系统
├── kernel/         # 内核子系统
├── module/         # 内核模块参数
└── power/          # 电源管理
```

实用示例：

```bash
# 查看 CPU 频率
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq

# 设置 CPU 调度策略
echo performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor

# 查看网卡速率
cat /sys/class/net/eth0/speed

# 控制 LED 亮度（笔记本）
echo 100 > /sys/class/backlight/intel_backlight/brightness
```

---

## `/tmp` — 临时文件

`/tmp` 用于存放程序运行时产生的**临时文件**，系统重启后会被清空（某些系统使用 tmpfs，存于内存中）。

- 所有用户均可写入
- 文件通常在重启后或一段时间后自动删除（通过 `systemd-tmpfiles` 管理）
- 权限设置了 **sticky bit**（`drwxrwxrwt`），防止用户删除他人文件

```bash
ls -ld /tmp
# drwxrwxrwt 16 root root 4096 ...
```

> ⚠️ 不要在 `/tmp` 中存放重要数据。对于需要持久化的临时数据，应使用 `/var/tmp`（重启后不自动清除）。

---

## `/usr` — 用户程序与数据

`/usr` 是文件系统中**最大的目录**之一，存放大多数用户级程序、库和文档。名称来自 *UNIX System Resources*（而非 user）。

### 子目录结构

```
/usr/
├── bin/        # 大多数用户命令（gcc、python、vim等）
├── sbin/       # 非关键系统管理命令
├── lib/        # 程序库文件
├── lib64/      # 64位程序库
├── include/    # C/C++ 头文件
├── share/      # 架构无关的共享数据
│   ├── doc/    # 文档
│   ├── man/    # man 手册页
│   ├── locale/ # 本地化文件
│   └── fonts/  # 字体
├── local/      # 本地安装的软件（手动编译安装）
│   ├── bin/
│   ├── lib/
│   └── share/
└── src/        # 部分软件的源代码（如内核源码）
```

### `/usr/local` 的特殊意义

`/usr/local` 专门用于存放**手动编译安装**的软件（`make install` 默认安装到此），与包管理器安装的软件分开，避免冲突：

```bash
# 手动编译安装 nginx 示例
./configure --prefix=/usr/local/nginx
make && make install
# 将安装到 /usr/local/nginx/
```

---

## `/var` — 可变数据

`/var` 存放**运行时持续变化的数据**，这些数据在系统运行过程中不断增长或改变。

### 重要子目录

| 目录 | 内容 |
|------|------|
| `/var/log/` | 系统和应用日志 |
| `/var/cache/` | 程序缓存数据（APT 下载的包等） |
| `/var/lib/` | 程序持久状态数据（数据库文件等） |
| `/var/spool/` | 待处理任务队列（打印队列、邮件队列） |
| `/var/tmp/` | 临时文件（重启后保留） |
| `/var/www/` | Web 服务器根目录（如 Apache/Nginx） |
| `/var/run/` | 运行时数据（现多为 `/run` 的链接） |
| `/var/lock/` | 锁文件 |
| `/var/mail/` | 用户邮件 |

### 重要日志文件

```bash
/var/log/
├── syslog          # 系统总日志（Debian/Ubuntu）
├── messages        # 系统总日志（RHEL/CentOS）
├── auth.log        # 认证日志（登录、sudo等）
├── kern.log        # 内核日志
├── dmesg           # 开机内核消息
├── apt/            # APT 操作日志
├── nginx/          # Nginx 访问和错误日志
├── mysql/          # MySQL 日志
└── journal/        # systemd journal 二进制日志
```

```bash
# 实时查看系统日志
tail -f /var/log/syslog

# 使用 journalctl 查看 systemd 日志
journalctl -f
journalctl -u nginx.service
journalctl --since "2026-03-23 00:00:00"
```

---

## 文件系统类型

Linux 支持多种文件系统，不同分区可以使用不同类型：

| 文件系统 | 特点 | 适用场景 |
|----------|------|----------|
| **ext4** | 成熟稳定，日志式 | 通用 Linux 分区（默认） |
| **xfs** | 高性能，适合大文件 | 服务器、数据库 |
| **btrfs** | 写时复制，支持快照 | 桌面、NAS |
| **tmpfs** | 基于内存，速度极快 | `/tmp`、`/run` |
| **proc** | 虚拟，呈现内核信息 | `/proc` |
| **sysfs** | 虚拟，呈现设备信息 | `/sys` |
| **vfat/FAT32** | 跨平台兼容 | EFI 分区、U 盘 |
| **ntfs** | Windows 兼容 | 共享分区 |
| **nfs** | 网络文件系统 | 网络共享 |

```bash
df -T                    # 查看各挂载点的文件系统类型
lsblk -f                 # 查看块设备文件系统
cat /proc/filesystems    # 内核支持的文件系统列表
```

---

## 磁盘挂载机制

Linux 通过**挂载（mount）**将文件系统附加到目录树上。

### `/etc/fstab` 配置

```
# <设备>          <挂载点>  <类型>  <选项>          <dump> <pass>
UUID=xxx-xxx     /         ext4    defaults,noatime  0      1
UUID=yyy-yyy     /boot     ext4    defaults          0      2
UUID=zzz-zzz     /home     ext4    defaults          0      2
UUID=www-www     swap      swap    sw                0      0
tmpfs            /tmp      tmpfs   defaults,size=2G  0      0
```

```bash
mount -a              # 挂载 fstab 中所有条目
mount /dev/sdb1 /mnt  # 手动挂载
umount /mnt           # 卸载
findmnt               # 查看挂载树
```

---

## 权限体系基础

Linux 文件权限是文件系统结构的重要组成部分：

```bash
ls -l /etc/passwd
# -rw-r--r-- 1 root root 2847 Mar 23 02:00 /etc/passwd
#  ↑↑↑↑↑↑↑↑↑   ↑    ↑
#  权限位      所有者 所属组
```

权限位解读（`rwxrwxrwx`）：
- 前3位：**所有者（owner）** 的读/写/执行权限
- 中3位：**所属组（group）** 的读/写/执行权限
- 后3位：**其他人（others）** 的读/写/执行权限

### 特殊目录的权限设计

```bash
ls -ld /tmp /root /etc /home
# drwxrwxrwt  root root  /tmp   ← 所有人可写，sticky bit 防删他人文件
# drwx------  root root  /root  ← 只有 root 可访问
# drwxr-xr-x  root root  /etc   ← 所有人可读，只有 root 可写
# drwxr-xr-x  root root  /home  ← 可列出目录，各用户目录权限各异
```

---

## 常用命令速查

### 查看磁盘与挂载

```bash
df -h              # 查看磁盘使用情况（人类可读格式）
du -sh /var/log    # 查看目录大小
lsblk              # 列出块设备树
blkid              # 查看块设备 UUID 和文件系统类型
findmnt            # 查看挂载点树状结构
mount | column -t  # 查看当前所有挂载
```

### 查找文件

```bash
find / -name "nginx.conf" 2>/dev/null    # 全局搜索文件名
find /etc -type f -newer /etc/passwd     # 查找比 passwd 更新的文件
locate nginx.conf                         # 使用数据库快速查找
which python3                             # 查找命令路径
whereis nginx                             # 查找程序、源码和手册位置
type ls                                   # 判断命令类型（内建/外部/别名）
```

### 查看文件系统信息

```bash
stat /etc/hosts          # 查看文件详细元数据
file /bin/ls             # 查看文件类型
readlink -f /bin/sh      # 解析符号链接真实路径
ls -lai /etc/            # 显示 inode 号
tune2fs -l /dev/sda1     # 查看 ext4 分区信息
```

---

## 总结

Linux 文件系统结构经过数十年的演进，形成了一套逻辑清晰、职责分明的目录体系：

- **启动相关**：`/boot`
- **设备抽象**：`/dev`、`/sys`
- **内核接口**：`/proc`
- **系统配置**：`/etc`
- **程序与库**：`/bin`、`/sbin`、`/lib`、`/usr`
- **用户数据**：`/home`、`/root`
- **运行时数据**：`/run`、`/tmp`
- **持久化数据**：`/var`
- **第三方软件**：`/opt`

理解这棵目录树，不仅有助于日常操作和排查问题，更能帮助你理解 Linux 的设计哲学：**简洁、模块化、一切皆文件**。

---

## 参考资料

- [Filesystem Hierarchy Standard 3.0](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html)
- [Linux man pages: hier(7)](https://man7.org/linux/man-pages/man7/hier.7.html)
- [The Linux Documentation Project](https://tldp.org/)
- [Arch Linux Wiki - Filesystem Hierarchy](https://wiki.archlinux.org/title/Filesystem_hierarchy)
