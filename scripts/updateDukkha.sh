#awk -F':' '{print $1}' /mnt/c/soft/dg/all.txt | uniq -c | sort
#cd /var/www/html
#cd $prefix/assets/texts/ru/sutta/
#asset


prefix=/media/c/soft/dg
prefix=/mnt/c/soft/dg

function commonGrep() {

grep -riE "\bсчасть" $prefix/assets/texts/ru/sutta/* | grep -v несчасть | grep -v "долго" | grep -v "богов и людей" #| grep -v  
}

commonGrep > $prefix/all.txt
grep -v ru-o.json $prefix/all.txt | grep edited > $prefix/edited.txt

echo >> $prefix/scripts/updateDukkha.sh
date >> $prefix/scripts/updateDukkha.sh
wc -l $prefix/all.txt $prefix/edited.txt | grep -v total >> $prefix/scripts/updateDukkha.sh
tail $prefix/scripts/updateDukkha.sh
#cd - 

exit 0

grep -f sukh.id  all.txt

for i in `cat sukh.id `; do echo $i ;  grep -ri -m1 $i assets/texts/ru/sutta/; done

#check doubles
find assets/texts/ru/sutta/ -type f  | awk -F'_' '{print $1}' | sort -V| uniq -c | sort -V | awk '{print $1, $2}' | grep -v "^1" | awk '{print $2}'

#remove doubles
cd assets/texts/ru/sutta
 for i in `find . -type f  | awk -F'_' '{print $1}' | sort -V| uniq -c | sort -V | awk '{print $1, $2}' | grep -v "^1" | awk '{print $2}'` 
 do 
 ls ${i}_*  
mv ${i}_*sv.json ../svEtc/automatic/
 done
